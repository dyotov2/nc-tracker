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
            db.run(`ALTER TABLE non_conformances ADD COLUMN needs_effectiveness_check INTEGER DEFAULT 0`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN standard_reference TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN clause_reference TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN nc_source TEXT`, () => {});
            db.run(`ALTER TABLE non_conformances ADD COLUMN root_cause_category TEXT`, () => {
              // Create RCA comments table
              db.run(`
                CREATE TABLE IF NOT EXISTS rca_comments (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  nc_id INTEGER NOT NULL,
                  author_name TEXT NOT NULL,
                  comment_text TEXT NOT NULL,
                  comment_tag TEXT,
                  created_at TEXT NOT NULL,
                  FOREIGN KEY (nc_id) REFERENCES non_conformances(id) ON DELETE CASCADE
                )
              `, (err) => {
                if (err) {
                  console.error('Error creating rca_comments table:', err);
                }
                console.log('Database initialized successfully');
                resolve();
              });
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

    if (filters.nc_source) {
      query += ' AND nc_source = ?';
      params.push(filters.nc_source);
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
        root_cause, root_cause_category, corrective_actions, preventive_actions, responsible_person, responsible_person_email, due_date,
        closure_date, effectiveness_check_date, effectiveness_score, effectiveness_notes,
        needs_effectiveness_check, notes, standard_reference, clause_reference, nc_source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.root_cause_category || null,
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
      data.standard_reference || null,
      data.clause_reference || null,
      data.nc_source || null,
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

            // Get NC source breakdown
            db.all('SELECT nc_source, COUNT(*) as count FROM non_conformances WHERE nc_source IS NOT NULL GROUP BY nc_source', [], (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              stats.bySource = rows.reduce((acc, row) => {
                acc[row.nc_source] = row.count;
                return acc;
              }, {});
              resolve(stats);
            });
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

// Get analytics data
const getAnalytics = () => {
  return new Promise((resolve, reject) => {
    const analytics = {};

    // 1a: Average days to close
    db.get(
      `SELECT AVG(julianday(closure_date) - julianday(date_reported)) as avg_days_to_close
       FROM non_conformances
       WHERE status = 'Closed' AND closure_date IS NOT NULL AND date_reported IS NOT NULL`,
      [],
      (err, row) => {
        if (err) { reject(err); return; }
        analytics.avgDaysToClose = row.avg_days_to_close
          ? Math.round(row.avg_days_to_close * 10) / 10
          : null;

        // 1b: Overdue NCs count
        db.get(
          `SELECT COUNT(*) as overdue_count FROM non_conformances
           WHERE status != 'Closed' AND due_date IS NOT NULL AND due_date < date('now')`,
          [],
          (err, row) => {
            if (err) { reject(err); return; }
            analytics.overdueCount = row.overdue_count;

            // 1c: SLA compliance rate
            db.get(
              `SELECT
                COUNT(CASE WHEN closure_date <= due_date THEN 1 END) as on_time,
                COUNT(*) as total_with_due
               FROM non_conformances
               WHERE status = 'Closed' AND closure_date IS NOT NULL AND due_date IS NOT NULL`,
              [],
              (err, row) => {
                if (err) { reject(err); return; }
                analytics.slaComplianceRate = row.total_with_due > 0
                  ? Math.round((row.on_time / row.total_with_due) * 100)
                  : null;

                // 1d: Average effectiveness score
                db.get(
                  `SELECT AVG(effectiveness_score) as avg_effectiveness
                   FROM non_conformances
                   WHERE effectiveness_score IS NOT NULL AND effectiveness_score > 0`,
                  [],
                  (err, row) => {
                    if (err) { reject(err); return; }
                    analytics.avgEffectiveness = row.avg_effectiveness
                      ? Math.round(row.avg_effectiveness * 10) / 10
                      : null;

                    // 2: Department breakdown
                    db.all(
                      `SELECT
                        department,
                        COUNT(*) as total,
                        SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as open_count,
                        AVG(CASE
                          WHEN status = 'Closed' AND closure_date IS NOT NULL AND date_reported IS NOT NULL
                          THEN julianday(closure_date) - julianday(date_reported)
                          ELSE NULL
                        END) as avg_days_to_close
                       FROM non_conformances
                       WHERE department IS NOT NULL AND department != ''
                       GROUP BY department
                       ORDER BY total DESC`,
                      [],
                      (err, rows) => {
                        if (err) { reject(err); return; }
                        analytics.departmentBreakdown = rows.map(r => ({
                          department: r.department,
                          total: r.total,
                          openCount: r.open_count,
                          avgDaysToClose: r.avg_days_to_close
                            ? Math.round(r.avg_days_to_close * 10) / 10
                            : null
                        }));

                        // 3: Root cause categories
                        db.all(
                          `SELECT root_cause_category, COUNT(*) as count
                           FROM non_conformances
                           WHERE root_cause_category IS NOT NULL AND root_cause_category != ''
                           GROUP BY root_cause_category
                           ORDER BY count DESC`,
                          [],
                          (err, rows) => {
                            if (err) { reject(err); return; }
                            analytics.rootCauseCategories = rows.map(r => ({
                              category: r.root_cause_category,
                              count: r.count
                            }));

                            // 4: NC source breakdown
                            db.all(
                              `SELECT nc_source, COUNT(*) as count
                               FROM non_conformances
                               WHERE nc_source IS NOT NULL AND nc_source != ''
                               GROUP BY nc_source
                               ORDER BY count DESC`,
                              [],
                              (err, rows) => {
                                if (err) { reject(err); return; }
                                analytics.ncSourceBreakdown = rows.reduce((acc, r) => {
                                  acc[r.nc_source] = r.count;
                                  return acc;
                                }, {});

                                // 5: Closure time distribution
                                db.all(
                                  `SELECT
                                    CASE
                                      WHEN days < 7 THEN '< 7 days'
                                      WHEN days >= 7 AND days < 14 THEN '7-14 days'
                                      WHEN days >= 14 AND days < 30 THEN '14-30 days'
                                      WHEN days >= 30 AND days < 60 THEN '30-60 days'
                                      ELSE '60+ days'
                                    END as bucket,
                                    COUNT(*) as count
                                   FROM (
                                     SELECT julianday(closure_date) - julianday(date_reported) as days
                                     FROM non_conformances
                                     WHERE status = 'Closed'
                                       AND closure_date IS NOT NULL
                                       AND date_reported IS NOT NULL
                                   )
                                   GROUP BY bucket
                                   ORDER BY
                                     CASE bucket
                                       WHEN '< 7 days' THEN 1
                                       WHEN '7-14 days' THEN 2
                                       WHEN '14-30 days' THEN 3
                                       WHEN '30-60 days' THEN 4
                                       WHEN '60+ days' THEN 5
                                     END`,
                                  [],
                                  (err, rows) => {
                                    if (err) { reject(err); return; }
                                    const bucketOrder = ['< 7 days', '7-14 days', '14-30 days', '30-60 days', '60+ days'];
                                    const bucketMap = rows.reduce((acc, r) => { acc[r.bucket] = r.count; return acc; }, {});
                                    analytics.closureDistribution = bucketOrder.map(b => ({
                                      bucket: b,
                                      count: bucketMap[b] || 0
                                    }));

                                    // 6: Overdue NCs table
                                    db.all(
                                      `SELECT
                                        id, title, severity, department, responsible_person, due_date,
                                        CAST(julianday('now') - julianday(due_date) AS INTEGER) as days_overdue
                                       FROM non_conformances
                                       WHERE status != 'Closed'
                                         AND due_date IS NOT NULL
                                         AND due_date < date('now')
                                       ORDER BY days_overdue DESC`,
                                      [],
                                      (err, rows) => {
                                        if (err) { reject(err); return; }
                                        analytics.overdueNCs = rows;
                                        resolve(analytics);
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

// Get comments for an NC (oldest first)
const getCommentsByNCId = (ncId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM rca_comments WHERE nc_id = ? ORDER BY created_at ASC',
      [ncId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// Create new comment
const createComment = (data) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    const query = `
      INSERT INTO rca_comments (nc_id, author_name, comment_text, comment_tag, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      data.nc_id,
      data.author_name,
      data.comment_text,
      data.comment_tag || null,
      now
    ];

    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          nc_id: data.nc_id,
          author_name: data.author_name,
          comment_text: data.comment_text,
          comment_tag: data.comment_tag || null,
          created_at: now
        });
      }
    });
  });
};

// Get comment count for an NC
const getCommentCountByNCId = (ncId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM rca_comments WHERE nc_id = ?',
      [ncId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
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
  getNeedingEffectivenessCheck,
  getAnalytics,
  getCommentsByNCId,
  createComment,
  getCommentCountByNCId
};
