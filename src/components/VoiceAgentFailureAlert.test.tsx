import { fireEvent, render, screen } from '@testing-library/react';

import { VoiceAgentFailureAlert } from './VoiceAgentFailureAlert';

describe('VoiceAgentFailureAlert', () => {
  it('shows recovery actions for a failed voice session', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();

    render(
      <VoiceAgentFailureAlert
        message="Voice Copilot could not connect to the live session."
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Voice session needs attention');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Voice Copilot could not connect to the live session.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
