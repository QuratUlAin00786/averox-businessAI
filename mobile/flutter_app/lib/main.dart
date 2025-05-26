import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/storage_service.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/dashboard/presentation/pages/dashboard_page.dart';
import 'features/leads/presentation/pages/leads_page.dart';
import 'features/contacts/presentation/pages/contacts_page.dart';
import 'features/tasks/presentation/pages/tasks_page.dart';
import 'features/opportunities/presentation/pages/opportunities_page.dart';
import 'features/manufacturing/presentation/pages/manufacturing_page.dart';
import 'features/ai_assistant/presentation/pages/ai_chat_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize services
  await _initializeServices();
  
  runApp(
    const ProviderScope(
      child: AveroxBusinessAIApp(),
    ),
  );
}

Future<void> _initializeServices() async {
  final prefs = await SharedPreferences.getInstance();
  const secureStorage = FlutterSecureStorage();
  
  // Initialize core services
  StorageService.init(prefs, secureStorage);
  await ApiService.init();
  await AuthService.init();
}

class AveroxBusinessAIApp extends ConsumerWidget {
  const AveroxBusinessAIApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Averox Business AI',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: [
    // Authentication
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    
    // Main App Shell
    ShellRoute(
      builder: (context, state, child) => MainAppShell(child: child),
      routes: [
        // Dashboard
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardPage(),
        ),
        
        // CRM Routes
        GoRoute(
          path: '/leads',
          builder: (context, state) => const LeadsPage(),
        ),
        GoRoute(
          path: '/contacts',
          builder: (context, state) => const ContactsPage(),
        ),
        GoRoute(
          path: '/opportunities',
          builder: (context, state) => const OpportunitiesPage(),
        ),
        GoRoute(
          path: '/tasks',
          builder: (context, state) => const TasksPage(),
        ),
        
        // Manufacturing
        GoRoute(
          path: '/manufacturing',
          builder: (context, state) => const ManufacturingPage(),
        ),
        
        // AI Assistant
        GoRoute(
          path: '/ai-chat',
          builder: (context, state) => const AIChatPage(),
        ),
      ],
    ),
  ],
);

class MainAppShell extends StatefulWidget {
  final Widget child;
  
  const MainAppShell({
    super.key,
    required this.child,
  });

  @override
  State<MainAppShell> createState() => _MainAppShellState();
}

class _MainAppShellState extends State<MainAppShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppConstants.primaryColor,
        unselectedItemColor: Colors.grey,
        currentIndex: _currentIndex,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Leads',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.contacts),
            label: 'Contacts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.factory),
            label: 'Manufacturing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.smart_toy),
            label: 'AI Chat',
          ),
        ],
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          
          switch (index) {
            case 0:
              context.go('/dashboard');
              break;
            case 1:
              context.go('/leads');
              break;
            case 2:
              context.go('/contacts');
              break;
            case 3:
              context.go('/manufacturing');
              break;
            case 4:
              context.go('/ai-chat');
              break;
          }
        },
      ),
    );
  }
}

// Placeholder classes to prevent compilation errors
class AppTheme {
  static ThemeData get lightTheme => ThemeData.light();
  static ThemeData get darkTheme => ThemeData.dark();
}

class AppConstants {
  static const Color primaryColor = Colors.blue;
}

class StorageService {
  static void init(SharedPreferences prefs, FlutterSecureStorage storage) {}
}

class ApiService {
  static Future<void> init() async {}
}

class AuthService {
  static Future<void> init() async {}
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class LeadsPage extends StatelessWidget {
  const LeadsPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class ContactsPage extends StatelessWidget {
  const ContactsPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class OpportunitiesPage extends StatelessWidget {
  const OpportunitiesPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class TasksPage extends StatelessWidget {
  const TasksPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class ManufacturingPage extends StatelessWidget {
  const ManufacturingPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}

class AIChatPage extends StatelessWidget {
  const AIChatPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold();
}