import AppKit
import WebKit

// Loads the actual extension manifest in WebKit; does not alter Safari settings.
@MainActor
final class Probe: NSObject, WKNavigationDelegate, WKWebExtensionTab {
    var view: WKWebView!
    var controller: WKWebExtensionController!
    var context: WKWebExtensionContext!
    let enabled = !CommandLine.arguments.contains("--baseline")
    let granted = !CommandLine.arguments.contains("--denied")

    func start() async throws {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        if enabled {
            let folder = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("extension", isDirectory: true)
            let ext = try await WKWebExtension(resourceBaseURL: folder)
            guard ext.errors.isEmpty else { throw ext.errors[0] }
            context = WKWebExtensionContext(for: ext)
            // This harness uses an ephemeral data store, treated as private data.
            context.hasAccessToPrivateData = true
            if granted {
                context.setPermissionStatus(.grantedExplicitly, for: try WKWebExtension.MatchPattern(string: "http://127.0.0.1/*"))
            }
            controller = WKWebExtensionController(configuration: .nonPersistent())
            try controller.load(context)
            configuration.webExtensionController = controller
        }
        view = WKWebView(frame: NSRect(x: 0, y: 0, width: 600, height: 400), configuration: configuration)
        view.navigationDelegate = self
        controller?.didOpenTab(self)
        let port = CommandLine.arguments.first(where: { $0.hasPrefix("--port=") })?.dropFirst(7) ?? "8764"
        view.load(URLRequest(url: URL(string: "http://127.0.0.1:\(port)/probe.html")!))
    }

    func webView(for context: WKWebExtensionContext) -> WKWebView? { view }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("JSON.stringify(window.probeResults)") { value, error in
            if let error { print("FAIL: \(error)"); exit(1) }
            guard let text = value as? String,
                  let data = text.data(using: .utf8),
                  let results = try? JSONSerialization.jsonObject(with: data) as? [String: String] else {
                print("FAIL: probe did not run"); exit(1)
            }
            print(text)
            let expected = self.enabled && self.granted ? "SecurityError" : "created"
            guard results["top"] == expected, results["synchronousBlank"] == expected, results["srcdoc"] == expected,
                  results["httpFrame"] == expected, results["capture"] == "function" else {
                print("FAIL: expected top, synchronous about:blank and loaded frames = \(expected)"); exit(1)
            }
            print("PASS: \(self.enabled ? (self.granted ? "extension" : "permission denied") : "baseline") — actual WebKit extension runtime")
            exit(0)
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("FAIL: \(error)"); exit(1)
    }
}

@main @MainActor
struct Entry {
    static let probe = Probe()
    static func main() {
        let application = NSApplication.shared
        application.setActivationPolicy(.prohibited)
        Task { @MainActor in
            do { try await probe.start() } catch { print("FAIL: \(error)"); exit(1) }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 25) { print("FAIL: timeout"); exit(1) }
        application.run()
    }
}
