/**
 * 11/9 情報工学基礎「micro:bit AI ラボ」提出フォームを作成する
 * 使い方：script.google.com で新規プロジェクト → 貼り付け → createSubmitForm を実行
 * 実行ログの最後に出る「サイト用設定」の1行を、index.html の FORM_CONFIG に貼る
 */
function createSubmitForm() {
  var form = FormApp.create('【情報工学基礎 11/9】micro:bit AI ラボ 提出');
  form.setDescription('サイトの「提出フォームを開く」から開くと、サイトで書いたメモが入った状態になっています。内容を確認して送信してください。');
  form.setCollectEmail(true);

  var urlCheck = FormApp.createTextValidation().requireTextIsUrl().build();
  var steps = [];
  for (var i = 0; i <= 10; i++) steps.push('STEP ' + i);

  form.addTextItem().setTitle('ペアの相手の名前');

  // サイトの入力欄 → フォームの項目（キーは index.html の data-save と同じ）
  var items = {
    step:    form.addListItem().setTitle('どの STEP まで進んだ？').setChoiceValues(steps).setRequired(true),
    linkAI:  form.addTextItem().setTitle('AI 入りプログラムの共有リンク（STEP 8）').setValidation(urlCheck),
    link1:   form.addTextItem().setTitle('1限で作ったプログラムの共有リンク（任意）').setValidation(urlCheck),
    memo3:   form.addParagraphTextItem().setTitle('STEP 3 考えよう：「歩く」と「走る」で、グラフのどこが違った？'),
    memo4:   form.addParagraphTextItem().setTitle('STEP 4 考えよう：ルールで見分けられた？ 人や持ち方が変わったら？'),
    actions: form.addTextItem().setTitle('STEP 6：見分けた動き'),
    memo6:   form.addParagraphTextItem().setTitle('STEP 6：データを足して、どう変わった？'),
    memo7:   form.addParagraphTextItem().setTitle('STEP 7：相手の AI を試した結果'),
    memo7b:  form.addParagraphTextItem().setTitle('STEP 7 考えよう：他の人だとまちがえる理由／データのかたより／歩き方は個人情報？'),
    who:     form.addTextItem().setTitle('STEP 9：誰の？'),
    problem: form.addParagraphTextItem().setTitle('STEP 9：どんな困りごと？'),
    motion:  form.addParagraphTextItem().setTitle('STEP 9：どんな動きを見分ける？'),
    action:  form.addParagraphTextItem().setTitle('STEP 9：見分けたら、何をする？'),
    care:    form.addParagraphTextItem().setTitle('STEP 9：データを集めるときに気をつけること'),
    reflect: form.addParagraphTextItem().setTitle('気づき・発見・疑問・要望')
  };

  // 目印の値で事前入力URLを作り、そこから各項目の entry 番号を取り出す
  var res = form.createResponse();
  var marks = {};
  Object.keys(items).forEach(function (key) {
    var item = items[key];
    var mark = (key === 'step') ? 'STEP 0'
             : (key === 'linkAI' || key === 'link1') ? 'https://example.com/MARK_' + key
             : 'MARK_' + key;
    marks[key] = mark;
    // addListItem() 等は型付きの項目を返すので、そのまま createResponse できる
    res.withItemResponse(item.createResponse(mark));
  });
  var prefilled = res.toPrefilledUrl();

  var entries = {};
  prefilled.split('?')[1].split('&').forEach(function (pair) {
    var kv = pair.split('=');
    if (kv[0].indexOf('entry.') !== 0) return;
    var val = decodeURIComponent(kv[1].replace(/\+/g, ' '));
    Object.keys(marks).forEach(function (key) { if (marks[key] === val) entries[key] = kv[0]; });
  });

  var config = { url: form.getPublishedUrl(), entries: entries };
  Logger.log('編集用URL: ' + form.getEditUrl());
  Logger.log('サイト用設定（この1行を index.html の FORM_CONFIG に貼る）:');
  Logger.log('var FORM_CONFIG = ' + JSON.stringify(config) + ';');
}

/**
 * 作成済みのフォームから、サイト用設定の1行だけを出す（新しいフォームは作らない）
 * FORM_EDIT_URL にフォームの「編集画面」のURL（.../forms/d/xxxx/edit）を入れて実行
 */
var FORM_EDIT_URL = '';

function showFormConfig() {
  var form = FormApp.openByUrl(FORM_EDIT_URL);
  var keyByTitle = {
    'どの STEP まで進んだ？': 'step',
    'AI 入りプログラムの共有リンク（STEP 8）': 'linkAI',
    '1限で作ったプログラムの共有リンク（任意）': 'link1',
    'STEP 3 考えよう：「歩く」と「走る」で、グラフのどこが違った？': 'memo3',
    'STEP 4 考えよう：ルールで見分けられた？ 人や持ち方が変わったら？': 'memo4',
    'STEP 6：見分けた動き': 'actions',
    'STEP 6：データを足して、どう変わった？': 'memo6',
    'STEP 7：相手の AI を試した結果': 'memo7',
    'STEP 7 考えよう：他の人だとまちがえる理由／データのかたより／歩き方は個人情報？': 'memo7b',
    'STEP 9：誰の？': 'who',
    'STEP 9：どんな困りごと？': 'problem',
    'STEP 9：どんな動きを見分ける？': 'motion',
    'STEP 9：見分けたら、何をする？': 'action',
    'STEP 9：データを集めるときに気をつけること': 'care',
    '気づき・発見・疑問・要望': 'reflect'
  };
  var res = form.createResponse();
  var marks = {};
  form.getItems().forEach(function (it) {
    var key = keyByTitle[it.getTitle()];
    if (!key) return;
    var t = it.getType(), item, mark;
    if (t === FormApp.ItemType.LIST) { item = it.asListItem(); mark = 'STEP 0'; }
    else if (t === FormApp.ItemType.PARAGRAPH_TEXT) { item = it.asParagraphTextItem(); mark = 'MARK_' + key; }
    else if (t === FormApp.ItemType.TEXT) { item = it.asTextItem(); mark = (key === 'linkAI' || key === 'link1') ? 'https://example.com/MARK_' + key : 'MARK_' + key; }
    else return;
    marks[key] = mark;
    res.withItemResponse(item.createResponse(mark));
  });
  var entries = {};
  res.toPrefilledUrl().split('?')[1].split('&').forEach(function (pair) {
    var kv = pair.split('=');
    if (kv[0].indexOf('entry.') !== 0) return;
    var val = decodeURIComponent(kv[1].replace(/\+/g, ' '));
    Object.keys(marks).forEach(function (key) { if (marks[key] === val) entries[key] = kv[0]; });
  });
  Logger.log('var FORM_CONFIG = ' + JSON.stringify({ url: form.getPublishedUrl(), entries: entries }) + ';');
}
