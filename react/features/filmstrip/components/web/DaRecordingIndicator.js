/* @flow */

import React from 'react';
import { IconRec } from '../../../base/icons';
import { BaseIndicator } from '../../../base/react';
import { connect } from '../../../base/redux';
import AbstractDaRecordingIndicator, {
    type Props as AbstractProps,
    _mapStateToProps
} from '../AbstractDaRecordingIndicator';

/**
 * The type of the React {@code Component} props of {@link DaRecordingIndicator}.
 */
type Props = AbstractProps & {

    /**
     * The font-size for the icon.
     */
    iconSize: number,

    /**
     * From which side of the indicator the tooltip should appear from.
     */
    tooltipPosition: string
};

/**
 * Thumbnail badge showing that the participant would like to speak.
 *
 * @extends Component
 */
class DaRecordingIndicator extends AbstractDaRecordingIndicator<Props> {
    /**
     * Renders the platform specific indicator element.
     *
     * @returns {React$Element<*>}
     */
    _renderIndicator() {
        return (
            <BaseIndicator
                className = 'darecordingindicator indicator show-inline'
                icon = { IconRec }
                iconClassName = 'indicatoricon'
                iconSize = { `${this.props.iconSize}px` }
                tooltipKey = 'daRecordingStart'
                tooltipPosition = { this.props.tooltipPosition } />
        );
    }
}

export default connect(_mapStateToProps)(DaRecordingIndicator);
