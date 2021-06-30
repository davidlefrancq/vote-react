import React from 'react';
import AddressFormater from "../utils/AddressFormater";
import Explorers from "./explorers/Explorers";

const VotersList = (props) => {

    const {votersList, answerChoices} = props;

    /**
     * Rendu d'un vote
     * @param vote
     * @param index
     * @returns {JSX.Element}
     */
    const renderVote = (vote, index) => {
        return (
            <div key={index} className={"col-3"}>
                <div className={"row"}>
                    <div className={"col d-flex justify-content-center"}>
                        <div className={"mb-0 pb-0 pt-2"}>{AddressFormater.minimizer(vote.address)}</div>
                        <Explorers chain={props.chain} account={vote.address}/>
                        <div className={"mb-0 ms-2 pb-0 pt-2"}>| {answerChoices[vote.choice]} |</div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Rendu des votes
     * @returns {*}
     */
    const renderVotersList = () => {
        if (votersList.length > 0) {
            return votersList.map((vote, index) => {
                return renderVote(vote, index);
            });
        }
    }

    return (
        <div className={"row mt-5 pt-3 ps-3 pe-3 pb-5 border"}>
            <h2>Voters</h2>
            {renderVotersList()}
        </div>
    );
};

export default VotersList;
