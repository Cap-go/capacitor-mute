import Foundation

@objc public class Muted: NSObject {
    private var _isMuted = false
    public func initialize() {
        Mute.shared.notify = { [weak self] mut in
            self!._isMuted = mut
        }
        self.check()
    }
    @objc public func check() {
        Mute.shared.isPaused = false
        Mute.shared.check()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            Mute.shared.isPaused = true
        }
    }
    @objc public func isMuted() -> Bool {
        print("Mute", self._isMuted)
        return self._isMuted
    }
}
