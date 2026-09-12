import { defineConfig } from 'vite';
import glsl            from 'vite-plugin-glsl';

export default defineConfig({
  root: '.',                       // keep html at project root
  plugins: [glsl()],

  resolve: {
    alias: {
      // these keys must match the strings used in your JS imports
      'scene_config'                 : '/src/config/sceneSequenceConfig.js',
      'text_library_config'          : '/src/config/textLibraryConfig.js',
      'asset_library_config'         : '/src/config/assetLibraryConfig.js',
      'scene_content_factory'        : '/src/utils/sceneContentFactory.js',
      'occlusion_fixer'              : '/src/utils/occlusion_fixer.js',
      'overlap_needed'               : '/src/utils/overlapNeeded.js',
      'gaussian_blur_shader'         : '/src/shaders/gaussianBlurShader.js',
      'four_corner_gradient_shader'  : '/src/shaders/fourCornerGradientShader.js',
      'circular_wipe_shader'         : '/src/shaders/circularWipeShader.js',
      'transcript_utils'             : '/src/utils/transcriptUtils.js',
      'initialize_core_three_objects': '/src/init/initializeCoreThreeObjects.js',
      'load_transcript_data'         : '/src/init/loadTranscriptData.js',
      'create_scene_anchors'         : '/src/init/createSceneAnchors.js',
      'create_content_from_config'   : '/src/init/createContentFromConfig.js',
      'setup_post_processing'        : '/src/init/setupPostProcessing.js',
      'setup_lighting'               : '/src/init/setupLighting.js',
      'setup_camera_rig'             : '/src/init/setupCameraRig.js',
      'calculate_scene_durations'    : '/src/init/calculateSceneDurations.js',
      'timeline_builder'             : '/src/animation/timelineBuilder.js',
      'custom_ease_charles'          : '/src/utils/custom_ease_charles.js'
    }
  }
});

