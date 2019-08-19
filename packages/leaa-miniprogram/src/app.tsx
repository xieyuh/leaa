import Taro, { Component, Config } from '@tarojs/taro';
import { ApolloProvider } from '@apollo/react-hooks';

import { apolloClient } from '@leaa/miniprogram/src/libs';
import Index from '@leaa/miniprogram/src/pages/index';

class App extends Component {
  config: Config = {
    // prettier-ignore
    pages: [
      'pages/index/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'Leaa',
      navigationBarTextStyle: 'black',
    },
  };

  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <Index />
      </ApolloProvider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));