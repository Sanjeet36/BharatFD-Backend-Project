(async () => {
  const chai = await import('chai');
  const chaiHttp = await import('chai-http');
  const app = await import('../src/app');
  const FAQ = await import('../src/models/faq');
  const expect = chai.expect;

  chai.use(chaiHttp);

  describe('FAQ API', () => {
    beforeEach(async () => {
      await FAQ.deleteMany({});
    });

    describe('GET /api/faqs', () => {
      it('should get all FAQs', async () => {
        await FAQ.create([
          { question: 'Test Question 1', answer: 'Test Answer 1' },
          { question: 'Test Question 2', answer: 'Test Answer 2' },
        ]);

        const res = await chai.request(app).get('/api/faqs');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
      });

      it('should get FAQs in a specific language', async () => {
        const faq = await FAQ.create({
          question: 'Test Question',
          answer: 'Test Answer',
          translations: {
            es: { question: 'Pregunta de prueba', answer: 'Respuesta de prueba' },
          },
        });

        const res = await chai.request(app).get('/api/faqs?lang=es');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body[0].question).to.equal('Pregunta de prueba');
        expect(res.body[0].answer).to.equal('Respuesta de prueba');
      });
    });

    describe('POST /api/faqs', () => {
      it('should create a new FAQ', async () => {
        const newFAQ = {
          question: 'Test Question',
          answer: 'Test Answer',
        };

        const res = await chai.request(app).post('/api/faqs').send(newFAQ);
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('question', newFAQ.question);
        expect(res.body).to.have.property('answer', newFAQ.answer);
      });

      it('should return 400 if question or answer is missing', async () => {
        const res = await chai.request(app).post('/api/faqs').send({});
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('errors');
      });
    });
  });

  describe('Admin API', () => {
    beforeEach(async () => {
      await FAQ.deleteMany({});
    });

    describe('GET /admin/faqs', () => {
      it('should get all FAQs for admin', async () => {
        await FAQ.create([
          { question: 'Test Question 1', answer: 'Test Answer 1' },
          { question: 'Test Question 2', answer: 'Test Answer 2' },
        ]);

        const res = await chai.request(app).get('/admin/faqs');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
      });
    });

    describe('PUT /admin/faqs/:id', () => {
      it('should update an existing FAQ', async () => {
        const faq = await FAQ.create({ question: 'Old Question', answer: 'Old Answer' });

        const updatedFAQ = {
          question: 'Updated Question',
          answer: 'Updated Answer',
        };

        const res = await chai.request(app).put(`/admin/faqs/${faq._id}`).send(updatedFAQ);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('question', updatedFAQ.question);
        expect(res.body).to.have.property('answer', updatedFAQ.answer);
      });

      it('should return 404 if FAQ is not found', async () => {
        const nonExistentId = '60a5f7b9e5fdq1234567890';
        const res = await chai.request(app).put(`/admin/faqs/${nonExistentId}`).send({
          question: 'Updated Question',
          answer: 'Updated Answer',
        });
        expect(res).to.have.status(404);
      });
    });

    describe('DELETE /admin/faqs/:id', () => {
      it('should delete an existing FAQ', async () => {
        const faq = await FAQ.create({ question: 'Test Question', answer: 'Test Answer' });

        const res = await chai.request(app).delete(`/admin/faqs/${faq._id}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'FAQ deleted successfully');

        const deletedFAQ = await FAQ.findById(faq._id);
        expect(deletedFAQ).to.be.null;
      });

      it('should return 404 if FAQ is not found', async () => {
        const nonExistentId = '60a5f7b9e5fdq1234567890';
        const res = await chai.request(app).delete(`/admin/faqs/${nonExistentId}`);
        expect(res).to.have.status(404);
      });
    });
  });
})();