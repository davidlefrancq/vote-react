import React, {Component} from 'react';
import {AiFillDelete, AiFillEdit} from "react-icons/all";

class VoteAdministrator extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
        };
    }

    componentDidMount() {
        this.initIsActive();
    }

    initIsActive = () => {
        this.getIsActive().then((isActive) => {
            this.setStateIsActive(isActive);
        }).catch((error) => {
            console.error(error);
        });
    }

    setStateIsActive = (isActive) => {
        const state = {...this.state};
        state.isActive = isActive;
        this.setState(state);
    }

    isActiveHandle = () => {
        const isActive = !this.state.isActive
        this.setIsActive(isActive).then(() => {
            this.setStateIsActive(isActive);
            this.props.setVoteIsOpened(isActive);
        }).catch((error) => {
            console.error(error);
        });
    }

    questionHandle = (event) => {
        event.preventDefault();
        const question = event.target.question.value;
        this.setQuestion(question).then(() => {
            event.target.question.value = "";
            this.props.setQuestion(question);
        }).catch((error) => {
            console.error(error);
        });
    }

    addChoiceHandle = (event) => {
        event.preventDefault();
        const answerChoice = event.target.addAnswerChoice.value;
        this.addAnswerChoice(answerChoice).then(() => {
            event.target.addAnswerChoice.value = "";
            this.props.addAnswerChoice(answerChoice);
        }).catch((error) => {
            console.error(error);
        });
    }

    deleteChoiceHandle = (index) => {
        this.deleteAnswerChoice(index).then(() => {
            // TODO : MAJ GUI
            this.props.deleteAnswerChoice(index);
        }).catch((error) => {
            console.error(error);
        });
    }

    setQuestion(question) {
        return this.props.contract.methods.setQuestion(question).send({from: this.props.account});
    }

    addAnswerChoice(answerChoice) {
        return this.props.contract.methods.addAnswerChoice(answerChoice).send({from: this.props.account});
    }

    deleteAnswerChoice(index) {
        return this.props.contract.methods.deleteAnswerChoice(index).send({from: this.props.account});
    }

    setIsActive(isActive) {
        return this.props.contract.methods.setIsActive(isActive).send({from: this.props.account});
    }

    getIsActive() {
        return this.props.contract.methods.isActive().call({from: this.props.account});
    }

    renderAnswerChoice(answerChoice, index) {
        return (
            <div key={index} className={"row mb-3"}>
                <div className={"col-1"}></div>
                <div className={"col text-start"}>{answerChoice}</div>
                <div className={"col text-end"}>
                    <button
                        className={"btn btn-outline-danger"}
                        style={{width: 50}}
                        onClick={() => {
                            this.deleteChoiceHandle(index)
                        }}
                    >
                        <AiFillDelete/>
                    </button>
                </div>
            </div>
        );
    }

    renderAnswerChoices() {
        return this.props.answerChoices.map((answerChoice, index) => {
            return this.renderAnswerChoice(answerChoice, index);
        });
    }

    render() {
        return (
            <div>
                <h2>Administrator</h2>

                <div className={"row mt-3 mb-3 p-1"}>
                    <div className={"col text-start pt-2"} style={{minWidth: 100}}>
                        Vote activing handle
                    </div>
                    <div className={"col text-start"}>
                        <button
                            className={this.state.isActive ? "btn btn-outline-success" : "btn btn-outline-secondary"}
                            style={{width: 50}}
                            onClick={() => {
                                this.isActiveHandle()
                            }}
                        >{this.state.isActive ? "on" : "off"}</button>
                    </div>
                </div>

                <form onSubmit={this.questionHandle}>
                    <div className="input-group mb-3 text-start">
                        <label className="form-label" style={{minWidth: 100}}>Question</label>
                        <input className="form-control" type={"text"} name={"question"}/>
                        <button className="btn btn-outline-primary" type="submit" style={{width: 50}}>
                            <AiFillEdit/>
                        </button>
                    </div>

                </form>

                <form onSubmit={this.addChoiceHandle}>
                    <div className="input-group mb-3 text-start">
                        <label className="form-label" style={{minWidth: 100}}>Add Choice</label>
                        <input className="form-control" type={"text"} name={"addAnswerChoice"}/>
                        <button className="btn btn-outline-primary" type="submit" style={{width: 50}}>
                            <AiFillEdit/>
                        </button>
                    </div>
                </form>

                <h3 className={"text-start"}>Answer Choices</h3>
                {this.renderAnswerChoices()}

            </div>
        );
    }
}

export default VoteAdministrator;
