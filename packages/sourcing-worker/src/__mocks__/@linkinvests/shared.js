// Jest mock for @linkinvests/shared package
// Mock the specific exports needed for tests

module.exports = {
  // Queue names
  INGEST_DECEASES_CSV_QUEUE: 'ingest-deceases-csv',
  SOURCE_ENERGY_SIEVES_QUEUE: 'source-energy-sieves',

  // Types - provide minimal mock implementations
  SuccessionInput: {},
  EnergyDiagnosticInput: {},

  // Schemas - provide minimal mock implementations
  energyDiagnosticInputSchema: {
    parse: (data) => data,
    safeParse: (data) => ({ success: true, data }),
  },
};