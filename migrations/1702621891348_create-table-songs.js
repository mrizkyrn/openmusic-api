/* eslint-disable camelcase */

exports.up = (pgm) => {
   pgm.createTable('songs', {
      id: {
         type: 'VARCHAR(50)',
         primaryKey: true,
      },
      title: {
         type: 'TEXT',
         notNull: true,
      },
      year: {
         type: 'INTEGER',
         notNull: true,
      },
      performer: {
         type: 'TEXT',
         notNull: true,
      },
      genre: {
         type: 'TEXT',
         notNull: true,
      },
      duration: {
         type: 'INTEGER',
         notNull: false,
      },
      albumId: {
         type: 'VARCHAR(50)',
         notNull: false,
      },
      created_at: {
         type: 'TEXT',
         notNull: true,
      },
      updated_at: {
         type: 'TEXT',
         notNull: true,
      },
   });

   pgm.addConstraint('songs', 'fk_songs.albums.id', 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
   pgm.dropTable('songs');
};
