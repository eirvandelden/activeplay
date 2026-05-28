import { Application } from '@hotwired/stimulus';

import ApCoreController from './controllers/ap-core-controller.js';
import ApTabsController from './controllers/ap-tabs-controller.js';
import ApChatInputController from './controllers/ap-chat-input-controller.js';
import ApChatMessagesController from './controllers/ap-chat-messages-controller.js';
import ApDiceBagController from './controllers/ap-dice-bag-controller.js';
import ApInitiativeGmController from './controllers/ap-initiative-gm-controller.js';
import ApInitiativePlayerController from './controllers/ap-initiative-player-controller.js';
import ApOnlineUsersController from './controllers/ap-online-users-controller.js';

const application = Application.start();

application.register('ap-core', ApCoreController);
application.register('ap-tabs', ApTabsController);
application.register('ap-chat-input', ApChatInputController);
application.register('ap-chat-messages', ApChatMessagesController);
application.register('ap-dice-bag', ApDiceBagController);
application.register('ap-initiative-gm', ApInitiativeGmController);
application.register('ap-initiative-player', ApInitiativePlayerController);
application.register('ap-online-users', ApOnlineUsersController);

window.Stimulus = application;

export default application;
