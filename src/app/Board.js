import React, {Component} from 'react';
import BoardController from './BoardController';

class Board extends Component {

    constructor(props) {
        super(props);

        this.typeSelectionChange = this.typeSelectionChange.bind(this);
        this.squareNumberSelectionChange = this.squareNumberSelectionChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    onMouseMove(e) {
        if (e.nativeEvent.offsetX < 0 || e.nativeEvent.offsetY < 0 || this.props.pathResult.length > 0) {
            return;
        }

        var convertedCoordinates = this.props.convertCoordinatesToPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

        let squareType = this.props.board[convertedCoordinates];
        let specialSquares = ['1', '2', '3', '4'];

        if (specialSquares.indexOf(squareType) > -1) {
            return;
        }

        if (this.props.selectStartPosition && !this.props.startPositionSet) {
            this.updateStartPosition(convertedCoordinates);
        }
        else if (this.props.selectEndPosition && !this.props.endPositionSet) {
            this.updateEndPosition(convertedCoordinates);
        }
        else if (this.props.selectObstaclePosition) {
            this.updateObstaclePosition(convertedCoordinates);
        }
    }

    updateStartPosition(index) {
        this.props.updateStartPosition(index);
    }

    updateEndPosition(index) {
        this.props.updateEndPosition(index);
    }

    updateObstaclePosition(index) {
        this.props.updateObstaclePosition(index);
    }

    componentDidMount() {
        this.createGridPattern();
    }

    componentWillUpdate() {
        if (this.props.boardUpdateNeeded) {
            this.cleanCanvas();
            this.createGridPattern();
        }
    }

    componentDidUpdate() {
        for (let i = 0; i < this.props.board.length; i++) {
            if (this.props.board[i] === 1) {
                this.createSquare(i, 'blue');
            }
            else if (this.props.board[i] === 2) {
                this.createSquare(i, 'black');
            }
            else if (this.props.board[i] === 3) {
                this.createSquare(i, 'green');
            }
        }

        if (this.props.pathResult !== null && this.props.pathResult.length > 0 && this.props.timerSet === false) {
            this.props.handleTimerCreation();
            if (this.timerID === undefined) {
                this.timerID = setInterval(
                    () => this.drawPathResult(),
                    100
                );
            }
        }
    }

    cleanCanvas() {
        var canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.clearRect(0, 0, this.props.boardWidth, this.props.boardWidth);
        canvasContext.beginPath();
    }

    createGridPattern() {
        var scale = this.props.boardWidth / this.props.squaresPerWidth;

        var canvasContext = this.refs.canvas.getContext('2d');
        for (let i = 1; i < this.props.squaresPerWidth; i++) {
            canvasContext.moveTo(i * scale, 0);
            canvasContext.lineTo(i * scale, this.props.squaresPerWidth * scale);
        }

        for (let i = 1; i < this.props.squaresPerWidth; i++) {
            canvasContext.moveTo(0, i * scale);
            canvasContext.lineTo(this.props.squaresPerWidth * scale, i * scale);
        }

        canvasContext.stroke();

        this.props.gridUpdated();
    }

    drawPathResult() {
        const pathResult = this.props.pathResult;
        const pathResultLength = pathResult.length;
        const currentIndex = this.props.nextItemIndex;

        let newIndex = 0;

        if (currentIndex === 0) {
            this.createSquare(pathResult[currentIndex + 1], 'pink');
            clearInterval(this.timerID);
        }
        else if (currentIndex === pathResultLength - 2) {
            this.createSquare(pathResult[currentIndex], 'red');
            newIndex = currentIndex - 1;
        }
        else {
            this.createSquare(pathResult[currentIndex + 1], 'pink');
            this.createSquare(pathResult[currentIndex], 'red');
            newIndex = currentIndex - 1;
        }

        this.props.updateNextItemIndex(newIndex);

    }

    createSquare(i, color) {
        let scale = this.props.boardWidth / this.props.squaresPerWidth;

        let canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.fillStyle = color;
        let position = {
            x: (i * scale) % this.props.boardWidth,
            y: Math.floor(i / this.props.squaresPerWidth) * scale
        }

        canvasContext.fillRect(position.x, position.y, scale, scale);
        canvasContext.stroke();
    }

    typeSelectionChange(value) {
        if (value === 0) {
            this.props.selectingStartPosition();
        }
        else if (value === 1) {
            this.props.selectingObstaclePosition();
        }
        else if (value === 2)
            this.props.selectingEndPosition();
    }


    squareNumberSelectionChange(newSquareNumber) {
        this.props.handleSquareNumberChange(newSquareNumber);
    }

    handleReset() {
        var canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.clearRect(0, 0, this.props.boardWidth, this.props.boardWidth);
        canvasContext.beginPath();
        this.createGridPattern();
        clearInterval(this.timerID);
        this.timerID = undefined
        this.setState({
            startPositionSet: false,
            endPositionSet: false
        });
        this.props.resetApplication();
    }


    render() {
        var positionsSet = (this.props.startPositionSet & this.props.endPositionSet);
        return (
            <div className="Board">
                <canvas ref="canvas" width={this.props.boardWidth} height={this.props.boardWidth}
                        onMouseDown={this.onMouseMove}
                        style={{borderWidth: '1px', borderStyle: 'outset', borderColor: '#000000'}}></canvas>
                <BoardController positionsSet={positionsSet}
                                 typeSelectionChange={this.typeSelectionChange}
                                 squareNumberChange={this.squareNumberSelectionChange}
                                 resetApplication={this.handleReset}
                                 squareType={this.props.squareType}
                                 squaresPerWidth={this.props.squaresPerWidth}/>
            </div>
        )
    }

}

export default Board;