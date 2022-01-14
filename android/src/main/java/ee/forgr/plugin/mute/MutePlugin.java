package ee.forgr.plugin.mute;

import android.content.Context;
import android.media.AudioManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Mute")
public class MutePlugin extends Plugin {

    @PluginMethod
    public void isMuted(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", true);
        AudioManager audio = (AudioManager) this.bridge.getContext().getSystemService(Context.AUDIO_SERVICE);
        switch ( audio.getRingerMode() ) {
            case AudioManager.RINGER_MODE_NORMAL:
                ret.put("value", false);
        }
        call.resolve(ret);
    }
}
