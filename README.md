# capacitor-mute
  <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin_mute"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin_mute"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>


Detect if the mute switch is enabled/disabled on a device

## Documentation

The most complete doc is available here: https://capgo.app/docs/plugins/mute/

## Install

```bash
npm install @capgo/capacitor-mute
npx cap sync
```

## Know issue

On IOS with Xcode 14 the lib use under the hood `Mute` is not configured as Apple expect anymore, it's not the only one having the issue as you can see here :
https://github.com/CocoaPods/CocoaPods/issues/8891

Solution:
Replace this to your Podfile:
```ruby
post_install do |installer|
  assertDeploymentTarget(installer)
end
```
By
```ruby
post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    if target.respond_to?(:product_type) and target.product_type == "com.apple.product-type.bundle"
      target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end
end
```
That should solve your issue.
I did open issue in the original repo to see if they can fix it:
https://github.com/akramhussein/Mute/issues/16
If no answer I will add the code directly to capacitor-mute


## API

<docgen-index>

* [`isMuted()`](#ismuted)
* [`getPluginVersion()`](#getpluginversion)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Capacitor Mute Plugin for detecting device mute status.

### isMuted()

```typescript
isMuted() => Promise<MuteResponse>
```

Check if the device mute switch is enabled.

**Returns:** <code>Promise&lt;<a href="#muteresponse">MuteResponse</a>&gt;</code>

**Since:** 1.0.0

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the native Capacitor plugin version.

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

**Since:** 1.0.0

--------------------


### Interfaces


#### MuteResponse

Response from mute status check.

| Prop        | Type                 | Description                              |
| ----------- | -------------------- | ---------------------------------------- |
| **`value`** | <code>boolean</code> | True if device is muted, false otherwise |

</docgen-api>
