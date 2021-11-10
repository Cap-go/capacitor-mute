import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(MutePlugin)
public class MutePlugin: CAPPlugin {
    private let implementation = Muted()
    override public func load() {
        implementation.initialize()
    }
    @objc func isMuted(_ call: CAPPluginCall) {
        call.resolve([
            "value": implementation.isMuted()
        ])
    }
}
