import React, {Component} from 'react';
import styles from './css/InfoBoard.css';

const InfoBoard = (props) => {

    return (
        <div className={styles.info}>
            <p>Information:</p>
            <ul>
                {props.info}
            </ul>
        </div>)

}

export default InfoBoard;