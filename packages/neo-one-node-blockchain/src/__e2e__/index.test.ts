describe('@neo-one/node-blockchain', () => {
  test('time to import', async () => {
    const time = await one.measureImport('@neo-one/node-blockchain');
    expect(time).toBeLessThan(1500);
  });

  test('time to require', async () => {
    const time = await one.measureRequire('@neo-one/node-blockchain');
    expect(time).toBeLessThan(600);
  });
});