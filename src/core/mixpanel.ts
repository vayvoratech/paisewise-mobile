import { Mixpanel } from 'mixpanel-react-native';

const MIXPANEL_TOKEN = '4d1fe9e2da0540b98412e39552ef4b95';

// Pass true to track automatic lifecycle events
const trackAutomaticEvents = true; 

const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents);

export const initMixpanel = async () => {
  await mixpanel.init();
  console.log("Mixpanel initialized successfully");
};

export default mixpanel;