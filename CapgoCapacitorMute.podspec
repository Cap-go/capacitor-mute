require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapgoCapacitorMute'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.resource_bundles = {
    'Mute' => ['ios/Sources/MutePlugin/Assets/*.aiff']
  }
  s.pod_target_xcconfig = { 'CODE_SIGNING_ALLOWED' => 'NO' }
  s.ios.deployment_target = '14.0'
  s.dependency 'Capacitor'
  s.frameworks = 'Foundation', 'AudioToolbox'
  s.swift_version = '5.1'
end
