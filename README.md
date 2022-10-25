# capacitor-mute
  <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
<h2><a href="https://capgo.app/">Check out: Capgo — Instant updates for capacitor</a></h2>
</div>

Detect if the mute switch is enabled/disabled on a device

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
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### isMuted()

```typescript
isMuted() => any
```

check if the device is muted

**Returns:** <code>any</code>

--------------------


### Interfaces


#### MuteResponse

| Prop        | Type                 |
| ----------- | -------------------- |
| **`value`** | <code>boolean</code> |

</docgen-api>
