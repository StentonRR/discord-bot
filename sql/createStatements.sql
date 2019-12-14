CREATE TABLE settings(
  my_id VARCHAR(20) PRIMARY KEY,
  prefix TEXT NOT NULL,
  test_server VARCHAR(20),
  dump_settings VARCHAR(20),
  rune VARCHAR(20),
  msg_color TEXT,
  twitch_id TEXT,
  log_channel VARCHAR(20),
  error_channel VARCHAR(20)
);

CREATE TABLE servers(
  id VARCHAR(20) PRIMARY KEY,
  name TEXT NOT NULL,
  streamlinkbool BOOLEAN DEFAULT False,
  streamrolebool BOOLEAN DEFAULT False,
  welcomerbool BOOLEAN DEFAULT False,
  welcomerchannel VARCHAR(20),
  bdaybool BOOLEAN DEFAULT False,
  bdaychannel VARCHAR(20)
);

CREATE TABLE bday(
  id VARCHAR(20) NOT NULL,
  bdaydate DATE NOT NULL,
  guild VARCHAR(20) NOT NULL,
  PRIMARY KEY (id, guild)
);

CREATE TABLE stream_t(
  id VARCHAR(20) NOT NULL,
  guild VARCHAR(20) NOT NULL,
  status BOOLEAN DEFAULT False,
  PRIMARY KEY (id, guild)
);

CREATE TABLE role_t(
  id VARCHAR(20) NOT NULL,
  regex TEXT,
  roleid VARCHAR(20) NOT NULL,
  PRIMARY KEY (id, roleid)
);
