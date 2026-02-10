// Optional script to seed the database with sample data for testing

const { createNC } = require('./database');

const sampleNCs = [
  {
    title: 'Product dimension out of tolerance',
    description: 'Measurement of part #A123 shows 10.5mm diameter instead of specified 10.0mm ±0.2mm tolerance.',
    date_reported: '2024-02-01',
    status: 'Closed',
    severity: 'Medium',
    category: 'Product',
    root_cause: 'Machining tool wear exceeded service limit',
    corrective_actions: 'Replaced machining tool, implemented preventive maintenance schedule',
    responsible_person: 'John Smith',
    due_date: '2024-02-15',
    closure_date: '2024-02-14',
    notes: 'All affected parts were reworked successfully'
  },
  {
    title: 'Missing quality inspection stamp',
    description: 'Batch #2024-045 shipped without final quality inspection stamp on documentation.',
    date_reported: '2024-02-03',
    status: 'Under Investigation',
    severity: 'High',
    category: 'Process',
    root_cause: 'Inspector was absent and backup process not followed',
    corrective_actions: 'Implementing mandatory checklist system with electronic verification',
    responsible_person: 'Sarah Johnson',
    due_date: '2024-02-20',
    notes: 'Customer notified, products verified retrospectively'
  },
  {
    title: 'Incorrect material used in assembly',
    description: 'Assembly line used steel bolts instead of stainless steel as specified in BOM.',
    date_reported: '2024-02-05',
    status: 'Action Required',
    severity: 'Critical',
    category: 'Product',
    root_cause: 'Similar-looking parts stored in adjacent bins without clear labeling',
    corrective_actions: 'Segregated storage, color-coded bins, added barcode scanning requirement',
    responsible_person: 'Mike Chen',
    due_date: '2024-02-12',
    notes: 'Recall of 50 units in progress'
  },
  {
    title: 'Documentation procedure outdated',
    description: 'Procedure DOC-123 references obsolete software version, causing confusion.',
    date_reported: '2024-02-06',
    status: 'Open',
    severity: 'Low',
    category: 'Documentation',
    responsible_person: 'Emily Davis',
    due_date: '2024-02-25',
    notes: 'Need to review all related procedures for consistency'
  },
  {
    title: 'Temperature excursion in storage area',
    description: 'Climate-controlled storage area temperature exceeded 25°C limit for 3 hours.',
    date_reported: '2024-02-07',
    status: 'Under Investigation',
    severity: 'High',
    category: 'Process',
    root_cause: 'HVAC system malfunction',
    responsible_person: 'David Wilson',
    due_date: '2024-02-10',
    notes: 'Affected inventory being evaluated for impact'
  }
];

async function seedDatabase() {
  console.log('Seeding database with sample data...');

  for (const nc of sampleNCs) {
    try {
      const created = await createNC(nc);
      console.log(`Created NC #${created.id}: ${nc.title}`);
    } catch (error) {
      console.error(`Error creating NC: ${error.message}`);
    }
  }

  console.log('Database seeding completed!');
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  const { initDatabase } = require('./database');
  initDatabase()
    .then(() => seedDatabase())
    .catch(err => {
      console.error('Error initializing database:', err);
      process.exit(1);
    });
}
