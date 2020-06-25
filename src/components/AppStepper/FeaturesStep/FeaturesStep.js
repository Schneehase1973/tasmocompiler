import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';

import availableFeatures from './AvailableFeatures';
import FeaturesSelector from './FeaturesSelector';
import NextButton from '../NextButton';
import BackButton from '../BackButton';
import { FormattedMessage } from 'react-intl';

const getFeaturesDefaultStates = () => {
  const defaults = {};

  availableFeatures.forEach((e) => {
    defaults[e.name] = e.value;

    if (e.group) {
      e.group.forEach((g) => {
        defaults[g] = e.value;
      });
    }
  });

  return defaults;
};

const getFeatureGroup = (name) => {
  const filtered = availableFeatures.filter((e) => e.name === name && e.group);

  if (filtered.length > 0) {
    return filtered[0].group;
  }

  return [];
};

const getFeatureExclude = (name) => {
  const filtered = availableFeatures.filter(
    (e) => e.name === name && e.exclude
  );

  if (filtered.length > 0) {
    return filtered[0].exclude;
  }

  return [];
};

const getFeatureInclude = (name) => {
  const filtered = availableFeatures.filter(
    (e) => e.name === name && e.include
  );

  if (filtered.length > 0) {
    return filtered[0].include;
  }

  return [];
};

const getCustomParametersForFeature = (name) => {
  const filtered = availableFeatures.filter((e) => e.name === name && e.custom);
  if (filtered.length > 0) {
    return filtered[0].custom;
  }

  return '';
};

const getBuildFlagForFeature = (name) => {
  const filtered = availableFeatures.filter(
    (e) => e.name === name && e.buildflag
  );
  if (filtered.length > 0) {
    return filtered[0].buildflag;
  }

  return '';
};

const setFeature = (name, state) => {
  const newState = {};
  const group = getFeatureGroup(name);
  const custom = getCustomParametersForFeature(name);
  const buildFlag = getBuildFlagForFeature(name);

  newState[name] = state;
  group.forEach((item) => {
    newState[item] = state;
  });

  if (custom) {
    newState[`precustom_${name}`] = state ? custom : '';
  }

  if (buildFlag) {
    newState[`buildflag_${name}`] = state ? buildFlag : '';
  }
  return newState;
};

class FeaturesStep extends Component {
  constructor(props) {
    super(props);

    const defaultStates = getFeaturesDefaultStates();
    this.state = { ...defaultStates };

    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  handleChangeCheckBox(event) {
    let featureState = setFeature(event.target.name, event.target.checked);
    const excludeGroup = getFeatureExclude(event.target.name);
    const includeGroup = getFeatureInclude(event.target.name);

    if (event.target.checked) {
      excludeGroup.forEach((item) => {
        featureState = {
          ...featureState,
          ...setFeature(item, !event.target.checked),
        };
      });
      includeGroup.forEach((item) => {
        featureState = {
          ...featureState,
          ...setFeature(item, event.target.checked),
        };
      });
    }

    this.setState(featureState);
  }

  handleNext() {
    const { nextHandler } = this.props;
    nextHandler({ ...this.state });
  }

  handleBack() {
    const { backHandler } = this.props;
    backHandler();
  }

  render() {
    const { ...tempState } = this.state;
    const { classes, nextHandler, backHandler, ...other } = this.props;

    return (
      <Step {...other}>
        <StepLabel>
          <FormattedMessage id="stepFeaturesTitle" />
        </StepLabel>
        <StepContent>
          <Typography>
            <FormattedMessage id="stepFeaturesDesc" />
          </Typography>
          <div className={classes.actionsContainer}>
            {availableFeatures.map(
              (item) =>
                item.show && (
                  <FeaturesSelector
                    classes={classes}
                    // value={this.state[item.name]}
                    value={tempState[item.name]}
                    item={item}
                    onChange={this.handleChangeCheckBox}
                    key={item.name}
                  />
                )
            )}
          </div>
          <div className={classes.actionsContainer}>
            <div className={classes.wrapper}>
              <BackButton disabled={false} onClick={this.handleBack} />
            </div>
            <div className={classes.wrapper}>
              <NextButton disabled={false} onClick={this.handleNext} />
            </div>
          </div>
        </StepContent>
      </Step>
    );
  }
}

FeaturesStep.propTypes = {
  classes: PropTypes.oneOfType([PropTypes.object]).isRequired,
  nextHandler: PropTypes.func.isRequired,
  backHandler: PropTypes.func.isRequired,
};

export default FeaturesStep;
