import { Router } from 'express';
import { MusicController } from '../controllers/music.controller';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';
export const MusicRoutes = (router: Router): void => {
  // Member routes
  router.get(
    '/members',
    [auth_user_active, auth_church],
    MusicController.getMembers,
  );
  router.post(
    '/members',
    [auth_user_active, auth_church],
    MusicController.createMember,
  );
  router.put(
    '/members',
    [auth_user_active, auth_church],
    MusicController.updateMember,
  );
  router.delete(
    '/members',
    [auth_user_active, auth_church],
    MusicController.deleteMember,
  );

  // Role routes
  router.get(
    '/roles',
    [auth_user_active, auth_church],
    MusicController.getRoles,
  );
  router.post(
    '/roles',
    [auth_user_active, auth_church],
    MusicController.createRole,
  );
  router.put(
    '/roles',
    [auth_user_active, auth_church],
    MusicController.updateRole,
  );
  router.delete(
    '/roles',
    [auth_user_active, auth_church],
    MusicController.deleteRole,
  );

  // Schedule routes
  router.get(
    '/schedules',
    [auth_user_active, auth_church],
    MusicController.getSchedules,
  );
  router.post(
    '/schedules',
    [auth_user_active, auth_church],
    MusicController.createSchedule,
  );
  router.put(
    '/schedules',
    [auth_user_active, auth_church],
    MusicController.updateSchedule,
  );
  router.delete(
    '/schedules',
    [auth_user_active, auth_church],
    MusicController.deleteSchedule,
  );

  // ServiceAssignment routes
  router.get(
    '/service-assignments',
    [auth_user_active, auth_church],
    MusicController.getServiceAssignments,
  );
  router.post(
    '/service-assignments',
    [auth_user_active, auth_church],
    MusicController.createServiceAssignment,
  );
  router.put(
    '/service-assignments',
    [auth_user_active, auth_church],
    MusicController.updateServiceAssignment,
  );
  router.delete(
    '/service-assignments',
    [auth_user_active, auth_church],
    MusicController.deleteServiceAssignment,
  );
};
