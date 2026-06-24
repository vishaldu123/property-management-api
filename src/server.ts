import app, { bootstrapIfNeeded } from './app';

const start = async () => {
  try {
    await bootstrapIfNeeded();
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  } catch (error) {
    console.error('Server startup failed', error);
    process.exit(1);
  }
};

start();
