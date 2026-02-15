import { Router } from 'express';
import { MusicController } from '../controllers/music.controller';
import auth_user from '../middlewares/auth_user';
import auth_church from '../middlewares/auth_church';

export const MusicRoutes = (router: Router): void => {
  // Member routes
  router.get('/members', [auth_user, auth_church], MusicController.getMembers);
  router.post(
    '/members',
    [auth_user, auth_church],
    MusicController.createMember,
  );
  router.put(
    '/members',
    [auth_user, auth_church],
    MusicController.updateMember,
  );
  router.delete(
    '/members',
    auth_user,
    auth_church,
    MusicController.deleteMember,
  );

  // Role routes
  router.get('/roles', [auth_user, auth_church], MusicController.getRoles);
  router.post('/roles', [auth_user, auth_church], MusicController.createRole);
  router.put('/roles', auth_user, MusicController.updateRole);
  router.delete('/roles', auth_user, MusicController.deleteRole);

  // Schedule routes
  router.get(
    '/schedules',
    [auth_user, auth_church],
    MusicController.getSchedules,
  );
  router.post(
    '/schedules',
    [auth_user, auth_church],
    MusicController.createSchedule,
  );
  router.put(
    '/schedules',
    [auth_user, auth_church],
    MusicController.updateSchedule,
  );
  router.delete('/schedules', auth_user, MusicController.deleteSchedule);

  // ServiceAssignment routes
  router.get(
    '/service-assignments',
    auth_user,
    MusicController.getServiceAssignments,
  );
  router.post(
    '/service-assignments',
    auth_user,
    MusicController.createServiceAssignment,
  );
  router.put(
    '/service-assignments',
    auth_user,
    MusicController.updateServiceAssignment,
  );
  router.delete(
    '/service-assignments',
    auth_user,
    MusicController.deleteServiceAssignment,
  );
};
