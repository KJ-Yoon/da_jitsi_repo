// @flow

import { Component } from 'react';

import { getParticipantById } from '../../base/participants';

export type Props = {

    /**
     * The participant id who we want to render the raised hand indicator
     * for.
     */
    participantId: string,

    /**
     * True if the hand is raised for this participant.
     */
    _daRecording?: boolean
}

/**
 * Implements an abstract class for the DaRecordingIndicator component.
 */
export default class AbstractDaRecordingIndicator<P: Props>
    extends Component<P> {

    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        if (!this.props._daRecording) {
            return null;
        }

        return this._renderIndicator();
    }

    /**
     * Renders the platform specific indicator element.
     *
     * @returns {React$Element<*>}
     */
    _renderIndicator: () => React$Element<*>

}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the component.
 * @returns {Object}
 */
export function _mapStateToProps(state: Object, ownProps: Props): Object {
    const participant = getParticipantById(state, ownProps.participantId);

    return {
        _daRecording: participant && participant.daRecording
    };
}
