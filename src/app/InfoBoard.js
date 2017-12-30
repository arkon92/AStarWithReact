import React, {Component} from 'react';

class InfoBoard extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log('InfoBoard did mount');
    }

    render() {

        return (<div className="InfoBoard">
            <ul>
                {this.props.info}
            </ul>
        </div>)

    }

}

export default InfoBoard;