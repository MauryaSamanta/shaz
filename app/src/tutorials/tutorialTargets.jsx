// tutorials/tutorialTargets.js

const targets = {};
const listeners = {};

export const registerTutorialTarget = (key, layout) => {
  targets[key] = layout;

  if (listeners[key]) {
    listeners[key].forEach(cb => cb(layout));
    delete listeners[key];
  }
};

export const getTutorialTarget = (key) => {
 
  return targets[key] || null;
};

// Allow waiting until target is registered
export const onTargetReady = (key, callback) => {
  if (targets[key]) {
    callback(targets[key]);
  } else {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  }
};
