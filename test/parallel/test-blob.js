'use strict';

const common = require('../common');
const assert = require('assert');
const { Blob } = require('buffer');
const { MessageChannel } = require('worker_threads');

{
  const b = new Blob();
  assert.strictEqual(b.size, 0);
  assert.strictEqual(b.type, '');
}

assert.throws(() => new Blob(false), {
  code: 'ERR_INVALID_ARG_TYPE'
});

assert.throws(() => new Blob('hello'), {
  code: 'ERR_INVALID_ARG_TYPE'
});

assert.throws(() => new Blob({}), {
  code: 'ERR_INVALID_ARG_TYPE'
});

assert.throws(() => new Blob(['test', 1]), {
  code: 'ERR_INVALID_ARG_TYPE'
});

{
  const b = new Blob([]);
  assert(b);
  assert.strictEqual(b.size, 0);
  assert.strictEqual(b.type, '');

  b.arrayBuffer().then(common.mustCall((ab) => {
    assert.deepStrictEqual(ab, new ArrayBuffer(0));
  }));
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, '');
  }));
  const c = b.slice();
  assert.strictEqual(c.size, 0);
}

{
  assert.throws(() => new Blob([], { type: 1 }), {
    code: 'ERR_INVALID_ARG_TYPE'
  });
  assert.throws(() => new Blob([], { type: false }), {
    code: 'ERR_INVALID_ARG_TYPE'
  });
  assert.throws(() => new Blob([], { type: {} }), {
    code: 'ERR_INVALID_ARG_TYPE'
  });
}

{
  const b = new Blob(['616263'], { encoding: 'hex', type: 'foo' });
  assert.strictEqual(b.size, 3);
  assert.strictEqual(b.type, 'foo');
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'abc');
  }));
}

{
  const b = new Blob([Buffer.from('abc')]);
  assert.strictEqual(b.size, 3);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'abc');
  }));
}

{
  const b = new Blob([new ArrayBuffer(3)]);
  assert.strictEqual(b.size, 3);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, '\0\0\0');
  }));
}

{
  const b = new Blob([new Uint8Array(3)]);
  assert.strictEqual(b.size, 3);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, '\0\0\0');
  }));
}

{
  const b = new Blob([new Blob(['abc'])]);
  assert.strictEqual(b.size, 3);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'abc');
  }));
}

{
  const b = new Blob(['hello', Buffer.from('world')]);
  assert.strictEqual(b.size, 10);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'helloworld');
  }));
}

{
  const b = new Blob(
    [
      'h',
      'e',
      'l',
      'lo',
      Buffer.from('world')
    ]);
  assert.strictEqual(b.size, 10);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'helloworld');
  }));
}

{
  const b = new Blob(['hello', Buffer.from('world')]);
  assert.strictEqual(b.size, 10);
  assert.strictEqual(b.type, '');

  const c = b.slice(1, -1, 'foo');
  assert.strictEqual(c.type, 'foo');
  c.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'elloworl');
  }));

  const d = c.slice(1, -1);
  d.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'llowor');
  }));

  const e = d.slice(1, -1);
  e.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'lowo');
  }));

  const f = e.slice(1, -1);
  f.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'ow');
  }));

  const g = f.slice(1, -1);
  assert.strictEqual(g.type, 'foo');
  g.text().then(common.mustCall((text) => {
    assert.strictEqual(text, '');
  }));

  assert.strictEqual(b.size, 10);
  assert.strictEqual(b.type, '');

  assert.throws(() => b.slice(-1, 1), {
    code: 'ERR_OUT_OF_RANGE'
  });
  assert.throws(() => b.slice(1, 100), {
    code: 'ERR_OUT_OF_RANGE'
  });

  assert.throws(() => b.slice(1, 2, false), {
    code: 'ERR_INVALID_ARG_TYPE'
  });
}

{
  const b = new Blob([Buffer.from('hello'), Buffer.from('world')]);
  const mc = new MessageChannel();
  mc.port1.onmessage = common.mustCall(({ data }) => {
    data.text().then(common.mustCall((text) => {
      assert.strictEqual(text, 'helloworld');
    }));
    mc.port1.close();
  });
  mc.port2.postMessage(b);
  b.text().then(common.mustCall((text) => {
    assert.strictEqual(text, 'helloworld');
  }));
}

{
  const b = new Blob(['hello'], { type: '\x01' });
  assert.strictEqual(b.type, '');
}