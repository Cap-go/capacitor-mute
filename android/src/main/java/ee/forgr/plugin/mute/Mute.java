package ee.forgr.plugin.mute;

import android.media.AudioManager;
import android.util.Log;

public class Mute {

    public String isMuted() {
        AudioManager audio = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        switch ( audio.getRingerMode() ) {
            case AudioManager.RINGER_MODE_NORMAL:
                Log.i("isMuted: false");
                return false;
        }
        Log.i("isMuted: true");
        return true;
    }
}
