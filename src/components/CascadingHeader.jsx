import React from 'react';
import './CascadingHeader.css';

/**
 * CascadingStickyHeader Component
 * 
 * Implements a scroll effect where:
 * 1. The `topRightContent` sticks to the top-right of the viewport immediately.
 * 2. There is a vertical gap (default 100px).
 * 3. The `bottomLeftContent` starts below the gap, scrolls up, and then sticks 
 *    to the top-left of the viewport, aligning with the `topRightContent`.
 * 
 * @param {ReactNode} topRightContent - Content to display in the top right sticky area.
 * @param {ReactNode} bottomLeftContent - Content to display in the bottom left sticky area.
 * @param {string} gap - Vertical space between the start of the two elements (default '100px').
 */
const CascadingHeader = ({
    topRightContent,
    bottomLeftContent,
    gap = '100px'
}) => {
    return (
        <>
            {/* Group A: Top Right Content */}
            <div className="csh-sticky-right">
                {topRightContent}
            </div>

            {/* Spacer to create the vertical offset */}
            {/* <div style={{ height: gap }} className="csh-spacer"></div> */}

            {/* Group B: Bottom Left Content */}
            <div className="csh-sticky-left">
                {bottomLeftContent}
            </div>
        </>
    );
};

export default CascadingHeader;
