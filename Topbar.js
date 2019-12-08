import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import Notification from 'Notification';
import actions from '{...actions}';
class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableNotification: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.showNotification &&
      this.props.showNotification !==
        prevProps.showNotification
    ) {
      // call the notification component
      this.setState({ enableNotification: true });
    }
    if (
      this.props.propertyPdfDownloaded !== prevProps.propertyPdfDownloaded &&
      this.props.propertyPdfDownloaded
    ) {
      this.setState({ enableNotification: false });
    }
  }

  render() {
    const { enableNotification } = this.state;
    return (
      {enableNotification && (
        <Notification
          {...propsList}}
        />
      )}
        
    );
  }
}

export default connect(
  state => ({
    ...state,
  }),
  { actions }
)(Topbar);
