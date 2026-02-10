const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ncs.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS non_conformances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL DEFAULT 'NC',
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          date_reported TEXT NOT NULL,
          status TEXT NOT NULL,
          severity TEXT NOT NULL,
          category TEXT,
          department TEXT,
          root_cause TEXT,
          corrective_actions TEXT,
          preventive_actions TEXT,
          responsible_person TEXT,
          responsible_person_email TEXT,
          due_date TEXT,
          closure_date TEXT,
          effectiveness_check_date TEXT,
          effectiveness_score INTEGER,
          effectiveness_notes TEXT,
          needs_effectiveness_check INTEGER DEFAULT 0,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Add columns if they don't exist (for existing databases)
          db.serialize(() => {
            db.run(`ALTER TABLE non_conformances ADD COLUMN type TEXT NOT NULL DEFAULT 'NC'`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN department TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN responsible_person_email TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN preventive_actions TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN effectiveness_check_date TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN effectiveness_score INTEGER`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN effectiveness_notes TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN needs_effectiveness_check INTEGER DEFAULT 0`, () => {
              console.log('Database initialized successfully');
              resolve();
            });
          });
        }
      });
    });
  });
};

// Get all NCs with optional filters
const getAllNCs = (filters = {}) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM non_conformances WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.severity) {
      query += ' AND severity = ?';
      params.push(filters.severity);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.department) {
      query += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Get single NC by ID
const getNCById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM non_conformances WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Create new NC
const createNC = (data) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    // Calculate effectiveness check date if NC is being closed
    let effectivenessCheckDate = data.effectiveness_check_date || null;
    let needsEffectivenessCheck = data.needs_effectiveness_check || 0;

    if (data.status === 'Closed' && data.closure_date && !effectivenessCheckDate) {
      const closureDate = new Date(data.closure_date);
      const checkDate = new Date(closureDate);
      checkDate.setMonth(checkDate.getMonth() + 4); // 4 months after closure (middle of 3-6 month range)
      effectivenessCheckDate = checkDate.toISOString().split('T')[0];
      needsEffectivenessCheck = 1;
    }

    const query = `
      INSERT INTO non_conformances (
        type, title, description, date_reported, status, severity, category, department,
        root_cause, corrective_actions, preventive_actions, responsible_person, responsible_person_email, due_date,
        closure_date, effectiveness_check_date, effectiveness_score, effectiveness_notes,
        needs_effectiveness_check, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.type || 'NC',
      data.title,
      data.description,
      data.date_reported,
      data.status,
      data.severity,
      data.category || null,
      data.department || null,
      data.root_cause || null,
      data.corrective_actions || null,
      data.preventive_actions || null,
      data.responsible_person || null,
      data.responsible_person_email || null,
      data.due_date || null,
      data.closure_date || null,
      effectivenessCheckDate,
      data.effectiveness_score || null,
      data.effectiveness_notes || null,
      needsEffectivenessCheck,
      data.notes || null,
      now,
      now
    ];

    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          ...data,
          effectiveness_check_date: effectivenessCheckDate,
          needs_effectiveness_check: needsEffectivenessCheck,
          created_at: now,
          updated_at: now
        });
      }
    });
  });
};

// Update NC
const updateNC = (id, data) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    // Calculate effectiveness check date if NC is being closed
    if (data.status === 'Closed' && data.closure_date && !data.effectiveness_check_date) {
      const closureDate = new Date(data.closure_date);
      const checkDate = new Date(closureDate);
      checkDate.setMonth(checkDate.getMonth() + 4); // 4 months after closure
      data.effectiveness_check_date = checkDate.toISOString().split('T')[0];
      data.needs_effectiveness_check = 1;
    }

    const fields = [];
    const params = [];

    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    fields.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const query = `UPDATE non_conformances SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id, ...data, updated_at: now });
      }
    });
  });
};

// Delete NC
const deleteNC = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM non_conformances WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ deleted: this.changes > 0 });
      }
    });
  });
};

// Get statistics for dashboard
const getStatistics = () => {
  return new Promise((resolve, reject) => {
    const stats = {};

    db.get('SELECT COUNT(*) as total FROM non_conformances', [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      stats.total = row.total;

      db.all('SELECT status, COUNT(*) as count FROM non_conformances GROUP BY status', [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        stats.byStatus = rows.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {});

        db.all('SELECT severity, COUNT(*) as count FROM non_conformances GROUP BY severity', [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          stats.bySeverity = rows.reduce((acc, row) => {
            acc[row.severity] = row.count;
            return acc;
          }, {});

          db.all(`
            SELECT date(date_reported) as date, COUNT(*) as count
            FROM non_conformances
            GROUP BY date(date_reported)
            ORDER BY date_reported DESC
            LIMIT 30
          `, [], (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            stats.timeline = rows;
            resolve(stats);
          });
        });
      });
    });
  });
};

// Get NCs that need effectiveness check
const getNeedingEffectivenessCheck = () => {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    db.all(
      `SELECT * FROM non_conformances
       WHERE needs_effectiveness_check = 1
       AND effectiveness_check_date <= ?
       AND (effectiveness_score IS NULL OR effectiveness_score = 0)
       ORDER BY effectiveness_check_date ASC`,
      [today],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

module.exports = {
  db,
  initDatabase,
  getAllNCs,
  getNCById,
  createNC,
  updateNC,
  deleteNC,
  getStatistics,
  getNeedingEffectivenessCheck
};
