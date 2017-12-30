import React, {Component} from 'react';

class BoardController extends Component {

    constructor(props) {
        super(props);

        this.handleChangeType = this.handleChangeType.bind(this);
        this.handleChangeSquareNumber = this.handleChangeSquareNumber.bind(this);
        this.handleResetApplication = this.handleResetApplication.bind(this);
    }

    componentDidMount() {
        console.log('BoardController did mount');
    }

    handleChangeType(event) {
        event.persist();
        this.props.typeSelectionChange(parseInt(event.target.value, 10));
    }

    handleChangeSquareNumber(event) {
        event.persist();
        this.props.squareNumberChange(parseInt(event.target.value, 10));
    }

    handleResetApplication() {
        this.props.resetApplication();
    }

    render() {
        if (this.props.positionsSet) {
            return (<div className="BoardController">
                <select value={this.props.squareType} onChange={this.handleChangeType}>
                    <option value="1">Obstacle</option>
                </select>
                <button type="button" onClick={this.handleResetApplication}>Reset!</button>
                <select value={this.props.squaresPerWidth} onChange={this.handleChangeSquareNumber}>
                    <option value="10">10x10</option>
                    <option value="20">20x20</option>
                    <option value="30">30x30</option>
                </select>
            </div>);
        }
        else {
            return (
                <div className="BoardController">
                    <select value={this.props.squareType} onChange={this.handleChangeType}>
                        <option value="0">Start position</option>
                        <option value="1">Obstacle</option>
                        <option value="2">End position</option>
                    </select>
                    <button type="button" onClick={this.handleResetApplication}>Reset!</button>
                    <select value={this.props.squaresPerWidth} onChange={this.handleChangeSquareNumber}>
                        <option value="10">10x10</option>
                        <option value="20">20x20</option>
                        <option value="30">30x30</option>
                    </select>
                </div>
            );
        }
    }

}

export default BoardController;