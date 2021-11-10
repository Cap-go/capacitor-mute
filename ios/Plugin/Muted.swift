import Foundation
import Mute

@objc public class Muted: NSObject {
    private var _isMuted = false
    public func initialize() {
        Mute.shared.checkInterval = 2.0
        // Always notify on interval
        Mute.shared.alwaysNotify = true

        // Update label when notification received
        Mute.shared.notify = { [weak self] mut in
            self!._isMuted = mut
        } 
    }
    @objc public func isMuted() -> Bool {
        Mute.shared.check()
        print("Mute", self._isMuted)
        return self._isMuted
    }
}
