import { faker } from '@faker-js/faker';
import { supabaseAdmin } from '../supabaseClient';

// Configuration - adjust these numbers based on needs
const SEED_CONFIG = {
  usersCount: 1000,
  organizationsCount: 15,
  eventsPerOrg: 10,
  maxAttendeesPerEvent: 50,
  rsvpRate: 0.7, // 70% of attendees will RSVP to events
};

async function createAuthUser(email: string, password: string) {
  try {
    const admin = (supabaseAdmin.auth as any).admin;
    if (!admin || !admin.createUser) {
      console.warn('Supabase admin.createUser is not available; skipping auth user creation');
      return null;
    }

    const { data, error } = await admin.createUser({ email, password, email_confirm: true });
    if (error) {
      console.warn('createUser error:', error);
      return null;
    }
    return (data && (data.user || data)) || null;
  } catch (err) {
    console.warn('createAuthUser exception:', err);
    return null;
  }
}

async function upsertLocalUser(email: string, supabaseId?: string) {
  const payload: any = { email };
  if (supabaseId) payload.supabase_id = supabaseId;
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(payload, { onConflict: 'email' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function upsertOrganization(userId: string, name: string, slug: string, description?: string) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .upsert({ user_id: userId, name, slug, description }, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function upsertOrgMember(orgId: string, userId: string, role = 'member') {
  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .upsert({ organization_id: orgId, user_id: userId, role }, { onConflict: 'organization_id,user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function upsertAttendee(userId: string, firstName: string, lastName: string) {
  const { data, error } = await supabaseAdmin
    .from('attendees')
    .insert({ user_id: userId, first_name: firstName, last_name: lastName })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function createEvent(orgId: string, title: string, description: string, start_time: string, end_time: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({ club_id: orgId, title, description, start_time, end_time })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function rsvp(eventId: string, attendeeId: string, status = 'going', guests = 0) {
  const { data, error } = await supabaseAdmin
    .from('event_attendees')
    .upsert({ event_id: eventId, attendee_id: attendeeId, status, guests }, { onConflict: 'event_id,attendee_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Helper to generate realistic event data
function generateEventData() {
  const eventTypes = [
    { prefix: 'Weekly', activity: ['Meeting', 'Practice', 'Session', 'Gathering'] },
    { prefix: 'Monthly', activity: ['Workshop', 'Seminar', 'Conference', 'Meetup'] },
    { prefix: 'Special', activity: ['Tournament', 'Competition', 'Showcase', 'Exhibition'] },
    { prefix: '', activity: ['Beginner Class', 'Advanced Training', 'Social Event', 'Networking Night'] },
  ];

  const type = faker.helpers.arrayElement(eventTypes);
  const activity = faker.helpers.arrayElement(type.activity);
  const title = type.prefix ? `${type.prefix} ${activity}` : activity;
  
  const startDate = faker.date.between({ 
    from: new Date(), 
    to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
  });
  
  const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000);

  return {
    title,
    description: faker.lorem.sentence(),
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
  };
}

// Helper to generate organization data
function generateOrganizationData() {
  const orgTypes = [
    'Club', 'Society', 'Association', 'Group', 'Community', 'Circle', 'League'
  ];
  
  const activities = [
    'Chess', 'Book', 'Running', 'Hiking', 'Photography', 'Cooking', 'Gaming',
    'Dance', 'Music', 'Art', 'Tech', 'Science', 'Film', 'Theater', 'Yoga',
    'Cycling', 'Swimming', 'Tennis', 'Basketball', 'Volleyball'
  ];

  const activity = faker.helpers.arrayElement(activities);
  const type = faker.helpers.arrayElement(orgTypes);
  const name = `${activity} ${type}`;
  const slug = faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(4);

  return {
    name,
    slug,
    description: faker.company.catchPhrase(),
  };
}

async function main() {
  console.log('🌱 Starting enhanced seed...');
  console.log(`📊 Config: ${SEED_CONFIG.usersCount} users, ${SEED_CONFIG.organizationsCount} orgs, ${SEED_CONFIG.eventsPerOrg} events/org`);

  // Step 1: Create users
  console.log('\n👥 Creating users...');
  const createdUsers: any[] = [];

  for (let i = 0; i < SEED_CONFIG.usersCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = 'Password123!';

    try {
      const authUser = await createAuthUser(email, password);
      const localUser = await upsertLocalUser(email, authUser?.id || undefined);
      createdUsers.push({ ...localUser, firstName, lastName });
      
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Created ${i + 1}/${SEED_CONFIG.usersCount} users`);
      }
    } catch (err) {
      console.warn(`   ⚠ Failed to create user ${email}:`, err);
    }
  }

  console.log(`✅ Created ${createdUsers.length} users\n`);

  // Step 2: Create attendees for all users
  console.log('🎫 Creating attendees...');
  const attendees: any[] = [];

  for (const user of createdUsers) {
    try {
      const attendee = await upsertAttendee(user.id, user.firstName, user.lastName);
      attendees.push({ ...attendee, userId: user.id });
    } catch (err) {
      console.warn(`   ⚠ Failed to create attendee for user ${user.id}`);
    }
  }

  console.log(`✅ Created ${attendees.length} attendees\n`);

  // Step 3: Create organizations
  console.log('🏢 Creating organizations...');
  const organizations: any[] = [];

  for (let i = 0; i < SEED_CONFIG.organizationsCount; i++) {
    const owner = faker.helpers.arrayElement(createdUsers);
    const orgData = generateOrganizationData();

    try {
      const org = await upsertOrganization(owner.id, orgData.name, orgData.slug, orgData.description);
      organizations.push(org);
      console.log(`   ✓ Created: ${orgData.name}`);
    } catch (err) {
      console.warn(`   ⚠ Failed to create org ${orgData.name}`);
    }
  }

  console.log(`✅ Created ${organizations.length} organizations\n`);

  // Step 4: Add members to organizations
  console.log('👤 Adding organization members...');
  let totalMembers = 0;

  for (const org of organizations) {
    // Each org gets 3-10 members
    const memberCount = faker.number.int({ min: 3, max: 10 });
    const selectedUsers = faker.helpers.arrayElements(createdUsers, memberCount);

    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      const role = i === 0 ? 'organizer' : (faker.number.int({ min: 1, max: 10 }) > 8 ? 'admin' : 'member');

      try {
        await upsertOrgMember(org.id, user.id, role);
        totalMembers++;
      } catch (err) {
        // Member might already exist, skip
      }
    }
  }

  console.log(`✅ Added ${totalMembers} organization memberships\n`);

  // Step 5: Create events
  console.log('📅 Creating events...');
  const events: any[] = [];

  for (const org of organizations) {
    for (let i = 0; i < SEED_CONFIG.eventsPerOrg; i++) {
      const eventData = generateEventData();

      try {
        const event = await createEvent(
          org.id,
          eventData.title,
          eventData.description,
          eventData.start_time,
          eventData.end_time
        );
        events.push({ ...event, orgId: org.id });
      } catch (err) {
        console.warn(`   ⚠ Failed to create event for org ${org.id}`);
      }
    }
  }

  console.log(`✅ Created ${events.length} events\n`);

  // Step 6: Create RSVPs
  console.log('✋ Creating RSVPs...');
  let totalRsvps = 0;

  for (const event of events) {
    // Get random attendees for this event
    const numAttendees = faker.number.int({ min: 1, max: SEED_CONFIG.maxAttendeesPerEvent });
    const selectedAttendees = faker.helpers.arrayElements(attendees, numAttendees);

    for (const attendee of selectedAttendees) {
      // Only some percentage will actually RSVP
      if (Math.random() > SEED_CONFIG.rsvpRate) continue;

      const statuses = ['going', 'maybe', 'not_going'];
      const weights = [0.7, 0.2, 0.1]; // 70% going, 20% maybe, 10% not going
      
      let status = 'going';
      const rand = Math.random();
      if (rand < weights[2]) status = 'not_going';
      else if (rand < weights[1] + weights[2]) status = 'maybe';

      const guests = status === 'going' ? faker.number.int({ min: 0, max: 3 }) : 0;

      try {
        await rsvp(event.id, attendee.id, status, guests);
        totalRsvps++;
      } catch (err) {
        // RSVP might already exist
      }
    }
  }

  console.log(`✅ Created ${totalRsvps} RSVPs\n`);

  // Summary
  console.log('═════════════════════════════════════');
  console.log('✨ Seeding completed successfully! ✨');
  console.log('═════════════════════════════════════');
  console.log(`📊 Summary:`);
  console.log(`   👥 Users: ${createdUsers.length}`);
  console.log(`   🎫 Attendees: ${attendees.length}`);
  console.log(`   🏢 Organizations: ${organizations.length}`);
  console.log(`   👤 Memberships: ${totalMembers}`);
  console.log(`   📅 Events: ${events.length}`);
  console.log(`   ✋ RSVPs: ${totalRsvps}`);
  console.log('═════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});