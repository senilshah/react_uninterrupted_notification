import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import html2canvas from 'html2canvas';
import actions from '{...actions}';
import { notification, Progress } from 'antd';
import { saveAs as savePdf } from 'file-saver';
import FirebaseHelper from 'helpers/firebase';
const { database } = FirebaseHelper;

class Notification extends Component {
  constructor(props) {
    super(props);
    // Not in state because it changes very fast
    this.pdfProgressDisplayed = 0;
    this.databaseListener = null;
    this.state = {
      pdfError: false,
      databaseListener: null,
      pdfProgressReference: 0,
    };
  }
  componentDidMount() {
    // this is to track the realtime update
    // assuming that the cloud function stores the progress into document
    let databaseListener = database
      .collection({collection})
      .doc({doc_id})
      .onSnapshot(
        function(doc) {
          let data = doc.data();
          if (conditions) {
            this.updatePdfProgressReference({...parameters});
          }
        }.bind(this)
      );
    this.setState({ databaseListener });
    this.handleSubmit();
  }

  componentDidUpdate(prevProps) {
    if (this.props.errorMessage !== prevProps.errorMessage) {
      this.setState({ pdfError: this.props.errorMessage }, () => {
        // handle error
      });
    }
    if (
      this.props.propertyPdfDownloaded !== prevProps.propertyPdfDownloaded &&
      this.props.propertyPdfDownloaded
    ) {
      savePdf(
        this.props.pdfData.data,
        decodeURIComponent(this.props.pdfData['headers']['pdf-title'])
      );
    }
  }

  componentWillUnmount() {
    let { databaseListener } = this.state;
    if (databaseListener != null) {
      // This will unsubscribe the database listener and thus avoid memory leaks
      databaseListener();
    }
  }
  notificationClose = waitTime => {
    let { pdfError } = this.state;
    if (pdfError) {
      this.setState({ pdfError: false });
      clearInterval(this.pdfInterval);
    }
    setTimeout(() => {
      notification.close('notification_progress');
      this.pdfProgressDisplayed = 0;
    }, waitTime);
  };
  updatePdfProgressReference = value => {
    let pdfProgressReference = value;
    this.setState({ pdfProgressReference });
    if (value === 100) {
      if (this.pdfInterval !== null) {
        clearInterval(this.pdfInterval);
      }
      this.pdfProgressDisplayed = 100;
      this.updateNotification();
      this.notificationClose(1500);
    }
  };

  updateNotification = () => {
    let { pdfProgressReference, pdfError } = this.state;
    // assuming downloading the pdf contains of 4 stages, so displaying the progress from 0 to 100 % smoothly.
    let diff = Math.max(0, pdfProgressReference - this.pdfProgressDisplayed);
    if (this.pdfProgressDisplayed < 100) {
      this.pdfProgressDisplayed = Math.min(
        99,
        this.pdfProgressDisplayed + diff * 0.05 + 0.1
      );
    }
    // if (this.props.pdfDownloading) {
    notification.open({
      className: 'hide-close-button',
      key: 'notification_progress',
      message: pdfError
          ? {Notification title when error occurs}
          : {Notification title},
      description: [
        pdfError
            ? {Notification description when error occurs}
          : {Notification description},
        }),
        <Progress
          key='notification_progress'
          style={{ margin: '18px 0 6px 0', display: 'block' }}
          type="circle"
          status={pdfError ? 'exception' : null}
          percent={parseFloat(this.pdfProgressDisplayed.toFixed(0))}
        />,
      ],
      duration: 0,
    });
    // }
    if (pdfError) {
      this.notificationClose(3000);
    }
  };
  handleSubmit = () => {
    // set notification content
    this.setState({ pdfProgressReference: 10 });

    // Start interval to make the progress smooth
    this.pdfProgressDisplayed = 0;
    this.pdfInterval = setInterval(() => {
      this.updateNotification();
    }, 100);

    // call the cloud function
  };

  render() {
    return '';
  }
}
export default connect(
  state => ({
    ...state,
  }),
  actions
)(Notification);
