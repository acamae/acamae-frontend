import authReducer from '@application/state/slices/authSlice';
import sessionTimerReducer from '@application/state/slices/sessionTimerSlice';

const rootReducer = {
  auth: authReducer,
  sessionTimer: sessionTimerReducer,
};

export default rootReducer;
