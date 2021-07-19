import React, {Component} from 'react';
import QuestionBarChart from "./QuestionBarChart";

class QuestionStatistics extends Component {

    responces;

    constructor(props) {
        super(props);
        this.state = {
            values: [],
        };
    }

    componentDidMount() {
        this.initValues();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.items.length != this.props.items.length) {
            this.initValues();
        }
    }

    initValues() {
        const {items} = this.props;
        const state = {...this.state};
        state.values = [];
        const {values} = state;
        this.responces = [];

        for (const key in items) {

            const item = items[key];
            const {choice} = item;

            if (values[choice]) {
                values[choice]++;
            } else {
                values[choice] = 1;
                this.responces.push(item.choice);
            }
        }

        this.setState(state);
    }

    renderQuestionBarChart(){
        const labels = []
        const data = []

        this.state.values.map((value, index) => {
            labels.push(this.props.answerChoices[index]);
            data.push(value);
        });

        return <QuestionBarChart labels={labels} data={data}/>;
    }

    render() {
        return (
            <div className={"p-3"}>
                <h2>Statistics</h2>
                {this.renderQuestionBarChart()}
            </div>
        );
    }
}

export default QuestionStatistics;

