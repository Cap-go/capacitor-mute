import XCTest
@testable import MutePlugin

final class MutePluginTests: XCTestCase {
    func testPluginMetadata() {
        let plugin = MutePlugin()

        XCTAssertEqual(plugin.identifier, "MutePlugin")
        XCTAssertEqual(plugin.pluginMethods.count, 1)
    }
}
