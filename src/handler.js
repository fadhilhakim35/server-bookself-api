const { nanoid } = require('nanoid');
const bookshelf = require('./books');

const addNoteHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBookshelf = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
    };
    bookshelf.push(newBookshelf);

    const isSuccess = bookshelf.filter((note) => note.id === id).length > 0;

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }
    
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

const getAllNotesHandler = (request, h) => {
    const { reading, finished, name } = request.query;
    let filteredBooks = bookshelf;

    if (reading !== undefined) {
        filteredBooks = filteredBooks.filter((book) => book.reading === (reading === '1'));
    }

    if (finished !== undefined) {
        filteredBooks = filteredBooks.filter((book) => book.finished === (finished === '1'));
    }

    if (name !== undefined) {
        filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }

    return {
        status: 'success',
        data: {
            books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
        },
    };
};

const getNoteByIdHandler = (request, h) => {
    const { id } = request.params;
   
    const note = bookshelf.filter((n) => n.id === id)[0];
   
    if (note !== undefined) {
      return {
        status: 'success',
        data: {
          book: note,
        },
      };
    }
   
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

const editNoteByIdHandler = (request, h) => {
    const { id } = request.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    const updatedAt = new Date().toISOString();

    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    const index = bookshelf.findIndex((note) => note.id === id);
    if (index !== -1) {
        bookshelf[index] = {
            ...bookshelf[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };
     
        const response = h.response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        });
        response.code(200);
        return response;
    }
    
    const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

const deleteNoteByIdHandler = (request, h) => {
    const { id } = request.params;
    const index = bookshelf.findIndex((note) => note.id === id);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }
     
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

module.exports = { addNoteHandler, getAllNotesHandler, getNoteByIdHandler, editNoteByIdHandler, deleteNoteByIdHandler };