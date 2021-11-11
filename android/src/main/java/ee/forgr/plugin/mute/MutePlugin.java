package ee.forgr.plugin.mute;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Mute")
public class MutePlugin extends Plugin {

    private Mute implementation = new Mute();

    @PluginMethod
    public void isMuted(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", implementation.isMuted());
        call.resolve(ret);
    }
}
