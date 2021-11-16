<template>
  <div class="v-body">
    {{textContent}}
    <video
      ref="video"
      id="video"
      width="300"
      height="200"
      style="border: 1px solid gray"
    ></video>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import adapter from 'webrtc-adapter';
// WebRTC适配器 只需要引入就ok
import { BrowserMultiFormatReader } from '@zxing/library';
/**
 * zxing demo
 */
export default {
  data: () => ({
    codeReader: new BrowserMultiFormatReader(),
    textContent: undefined
  }),
  async created () {
    this.codeReader.getVideoInputDevices()
      .then((videoInputDevices) => {
        const selectedDeviceId = videoInputDevices[0].deviceId;

        this.codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, 'video', (result, err) => {
          if (result) {
            console.log(result);
            this.textContent = result.text;
          }
          if (err && !(err)) {
            console.error(err);
          }
        });
        console.log(`Started continous decode from camera with id ${selectedDeviceId}`);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
</style>