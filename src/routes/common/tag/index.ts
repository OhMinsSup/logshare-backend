import * as Router from 'koa-router';
import * as tagCtrl from './tag.ctrl';

const tag = new Router();

tag.get('/', tagCtrl.getTags);
tag.get('/:tag', tagCtrl.getTagInfo);

export default tag;
