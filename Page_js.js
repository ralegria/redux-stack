import React from 'react';
import { withNavbarLayout } from '../../containers/withNavbarLayout';
import { withAuthRedirect } from '../../containers/withAuthRedirect';
import { GamePerformanceTable } from '../../components/GamePerformanceTable/GamePerformanceTable';
import './GamePage.less';
import { Row, Col, Icon, Card, Divider, Button } from 'antd';
import GameParametersTableForm from '../../components/GameParametersTableForm/GameParametersTableForm';
import PowerbiEmbedded from 'react-powerbi';
import { Link } from 'react-router-dom';
import { getGameById, selectGame } from '../../actions/games';
import { get } from 'lodash'
import { gameDetailSelector } from '../../selectors/games';
import { getGameReport } from '../../actions/reports';
import { withShouldRenderUpdate } from '../../containers/withShouldRenderUpdate';

import { SkeletonLoading } from '../../components/SkeletonLoading/SkeletonLoading';
import { TitleSkeleton } from './Skeleton/TitleSkeleton';
import { SubTitleSkeleton } from './Skeleton/SubTitleSkeleton';
import { GeneralInfoSkeleton } from './Skeleton/GeneralInfoSkeleton';
import { GameParameterSkeleton } from './Skeleton/GameParameterSkeleton';
import { TableSkeleton } from './Skeleton/TableSkeleton';
import { ReportSkeleton } from './Skeleton/ReportSkeleton';
import { clearForm } from '../../actions/forms';
import { GAME_PARAMETER_FORM } from '../../constants/forms';
import { REPORTS } from '../../constants/reports';
import { GAME_TYPE } from '../../constants/gameTypes';
import { gameReportsSelector } from '../../selectors/reports';
import { selectClass } from '../../actions/classes';
import { getGameReportFilters } from '../../helpers/pbiReports';

//Just update PowerbiEmbedded when props change
const PowerbiEmbeddedRenderUpdate = withShouldRenderUpdate(PowerbiEmbedded);

const mapStateToProps = (state, props) => {

    return {
        ...gameDetailSelector(state, props),
        reduxForm: state.forms,
        gameLoading: state.games.loading,
        roundParametersLoading: state.roundParameters.loading,
        reportLoading: get(state, 'reports.loading', false),
        reports: gameReportsSelector(state, props),
        runRoundLoading: get(state, 'games.runRoundLoading', false),
        session: get(state, 'session.session')
    };
}

class GamePage extends React.Component {

    constructor(props) {
        super(props);

        const gameId = get(props, 'match.params.id', undefined);
        if (gameId) {
            const { dispatch } = this.props;
            dispatch(selectGame(Number(gameId)));
            dispatch(getGameById(gameId, (err, game) => {
                if (err) return;
                dispatch(selectClass(game.classId));
                const reportType = (game.gameTypeId === 1) ? REPORTS.GAME : REPORTS.COMPUTER;
                dispatch(getGameReport(gameId, reportType));
            }));
        }
    }

    componentWillUnmount() {
        //Clear form previous data  
        this.props.dispatch(clearForm(GAME_PARAMETER_FORM));
    }

    afterRun = () => {
        const { game, dispatch } = this.props;
        const reportType = (game.gameTypeId === GAME_TYPE.HUMAN) ? REPORTS.GAME : REPORTS.COMPUTER;
        dispatch(getGameById(game.gameId));
        dispatch(clearForm(GAME_PARAMETER_FORM));
        dispatch(getGameReport(game.gameId, reportType));
    }

    canRunRound = () => {
        const { game = {} } = this.props;
        const gameTypeId = game.gameTypeId;
        return (GAME_TYPE.COMPUTER_DINAMIC_PLAYER_LEAD === gameTypeId
            || GAME_TYPE.COMPUTER_STATIC_PLAYER_LEAD === gameTypeId);
    }

    render() {

        const {
            gameClass = {},
            game = {},
            results = [],
            roundParameters = [],
            gameParametersErrors,
            session,
            gameLoading,
            reportLoading,
            reports,
            runRoundLoading
        } = this.props;
       
        const isComputerGame = game.gameTypeId > 1;
        const gameReport = reports.find((report) => {
            if (isComputerGame) {
                return report.type === REPORTS.COMPUTER
            } else {
                return report.type === REPORTS.GAME
            }
        });

        const canRunRound = this.canRunRound();
        let currentRound = game.currentRound;
        let isActive = true;
        // Game is computer game if is greather than
        if (isComputerGame) {
            currentRound = results.length + 1;
            if (currentRound > game.numberOfRounds) {
                currentRound = game.numberOfRounds;
                isActive = false;
            }
        }
        
        return <div className="rms-page game-page">
            <Row>
                <Col>
                    <SkeletonLoading ready={!gameLoading} loader={TitleSkeleton}>
                        <h1 className="page-title">
                            <Link to='/dashboard'>
                                <Icon type="arrow-left" className="back-icon" />
                            </Link>
                            {game.name}
                        </h1>
                    </SkeletonLoading>
                </Col>
            </Row>
            <Row style={{ paddingTop: '60px' }}>
                <Col className="game-page-section">
                    <SkeletonLoading ready={!gameLoading} hideDescription={true} loader={SubTitleSkeleton}>
                        <h2 className="section-title no-description">
                            General Information
                        </h2>
                    </SkeletonLoading>
                    <SkeletonLoading ready={!gameLoading} loader={GeneralInfoSkeleton}>
                        <Card className="rms-card game-card" bordered={false}>
                            <Row>
                                <Col span={8} className="general-info-item">
                                    <div className="header">COURSE NAME</div>
                                    <div className="content">{gameClass.className}</div>
                                </Col>
                                <Col span={8} className="general-info-item">
                                    <div className="header">GAME DESCRIPTION</div>
                                    <div className="content">{game.description}</div>
                                </Col>
                                <Col span={4} className="general-info-item">
                                    <div className="header">ROUND</div>
                                    <div className="content">{currentRound} / {game.numberOfRounds}</div>
                                </Col>
                                <Col span={4} className="general-info-item">
                                    <div className="header">HOTELS / TEAMS</div>
                                    <div className="content">{game.userCount}</div>
                                </Col>
                            </Row>
                        </Card>
                    </SkeletonLoading>
                </Col>
            </Row>
            <Row style={{ paddingTop: '40px' }}>
                <Col className="game-page-section">
                    <SkeletonLoading ready={!gameLoading} loader={SubTitleSkeleton}>
                        <h2 className="section-title">Game Parameters</h2>
                        <p className="description">Below are the parameters defined by your facilitator that represent your hotel marketplace, please take them into consideration as you play the game.</p>
                    </SkeletonLoading>
                    <SkeletonLoading ready={!gameLoading} loader={GameParameterSkeleton}>
                        <Card className="rms-card game-card game-parameter-card" bordered={false}>
                            <Row>
                                <Col className="parameter-info-item" span={12}>
                                    <div className="parameter-name">CAPACITY: <span className="parameter-value">{game.capacity}</span></div>
                                    {/*<div className="parameter-name">FORECASTED MARKET OCCUPANCY: <span className="parameter-value">85%</span></div>*/}
                                    <div className="parameter-name">DAILY FIXED COSTS: <span className="parameter-value">${game.dailyFixedCost}</span></div>
                                    <div className="parameter-name">VARIABLE COST / ROOM: <span className="parameter-value">${game.variableCosts}</span></div>

                                </Col>
                                <Col className="parameter-info-item" span={12}>
                                    <div className="parameter-name">DEAL VARIABLE COST: <span className="parameter-value">${game.dealVariableCosts}</span></div>
                                    <div className="parameter-name">DIRECT VARIABLE COST: <span className="parameter-value">${game.directVariableCosts}</span></div>
                                    <div className="parameter-name">OTA BASE COMMISSION: <span className="parameter-value">{game.percentOtaBase}%</span></div>

                                </Col>
                            </Row>
                        </Card>
                    </SkeletonLoading>
                </Col>
            </Row>
            <Row style={{ paddingTop: '40px' }}>
                <Col className="game-page-section">
                    <SkeletonLoading ready={!gameLoading} loader={SubTitleSkeleton}>
                        <h2 className="section-title"> Performance / Submissions</h2>
                        <p className="description"> Enter your prices and allocation below along with OTA Commission and Marketing Spend as instructed by your facilitator. Review the report to understand market dynamics and optimize your hotel's performance. Press "Submit" when you're ready to proceed.</p>
                    </SkeletonLoading>
                </Col>
            </Row>
            <Row style={{ paddingTop: '24px' }} className="game-tables-row">
                <Col span={12} className="game-page-section">
                    <SkeletonLoading ready={!gameLoading} loader={TableSkeleton}>
                        <h3>MY SUBMISSIONS</h3>
                        <GameParametersTableForm
                            dataSource={roundParameters}
                            currentRound={currentRound}
                            rounds={game.numberOfRounds}
                            isActive={isActive && game.isActive}
                            isComputerGame={isComputerGame}
                            gameId={game.gameId}
                            withMarketing={this.props.withMarketing}
                            reduxForm={this.props.reduxForm}
                            dispatch={this.props.dispatch}
                            canRunRound={canRunRound}
                            roundParametersLoading={this.props.roundParametersLoading}
                            capacity={game.capacity}
                            isViewablePPCSpend={game.isViewablePPCSpend}
                            isViewableDealPrice={game.isViewableDealPrice}
                            isViewableDealRooms={game.isViewableDealRooms}
                            isViewableOTA={game.isViewableOTA}
                            runRoundLoading={runRoundLoading}
                            afterRun={this.afterRun}
                        />
                    </SkeletonLoading>
                </Col>
                <Col span={12} className="game-page-section">
                    <SkeletonLoading ready={!gameLoading} loader={TableSkeleton}>
                        <h3 >MY PERFORMANCE</h3>
                        <GamePerformanceTable dataSource={results} />
                    </SkeletonLoading>
                </Col>
            </Row>
            {(currentRound > 1 || results.length >= 1) && <SkeletonLoading ready={!reportLoading} loader={ReportSkeleton}>
                <Row style={{ paddingTop: '96px' }} type="flex" justify="center">
                    <Col span={24} className="game-page-section">
                        <h2 >
                            Reports
                    </h2>
                    </Col>
                    <Col span={24} className="game-page-section">
                        <PowerbiEmbeddedRenderUpdate
                            id={get(gameReport, 'reportId', undefined)}
                            embedUrl={get(gameReport, 'embedUrl', undefined)}
                            accessToken={get(gameReport, 'token', undefined)}
                            filterPaneEnabled={false}
                            navContentPaneEnabled={true}
                            roundNumber={currentRound}
                            filters={getGameReportFilters(game.gameId, session.userId, get(gameReport, 'type'))}
                            tokenType={1}
                            width='100%'
                            height='692px'
                        />
                    </Col>
                </Row>
            </SkeletonLoading>}
        </div >
    }
}

export default withAuthRedirect(mapStateToProps)(withNavbarLayout(GamePage));
