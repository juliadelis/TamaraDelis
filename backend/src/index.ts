import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const port = process.env.PORT || 4006;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
