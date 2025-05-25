import { useContext } from 'react';
import FocusSessionContext from '../contexts/FocusSessionContext';

const useFocusSession = () => {
  const context = useContext(FocusSessionContext);
  if (context === undefined) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider');
  }
  return context;
};

export default useFocusSession;