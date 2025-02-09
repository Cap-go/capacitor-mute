import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(MutePlugin)
public class MutePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MutePlugin"
    public let jsName = "Mute"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isMuted", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = Muted()
    override public func load() {
        implementation.initialize()
    }
    @objc func isMuted(_ call: CAPPluginCall) {
        self.implementation.check()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            call.resolve([
                "value": self.implementation.isMuted()
            ])
        }
    }
}
